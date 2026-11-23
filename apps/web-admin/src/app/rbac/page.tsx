'use client';

import {
  PERMISSIONS,
  type AuditLogDto,
  type Permission,
  type RoleDto,
  type StaffUserDto,
  type UserStatus,
} from '@limousine-workspace/shared-types';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  DataTable,
  DateTime,
  Field,
  FilterBar,
  Input,
  Phone,
  SegmentedControl,
  StatusTag,
  useConfirm,
  useToast,
} from '@limousine-workspace/shared-ui';
import { Modal, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Copy,
  FileSpreadsheet,
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
  Unlock,
  UserPlus,
  Users,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '../../components/shell/AdminShell';
import { adminApi, exportToCsv } from '../../lib/api';

type RbacTab = 'users' | 'roles' | 'permissions' | 'audit';

const PERMISSION_GROUPS: {
  group: string;
  items: { slug: Permission; label: string }[];
}[] = [
  {
    group: 'Tổng quan & Báo cáo',
    items: [
      { slug: 'dashboard.view', label: 'Xem Bảng điều khiển (Dashboard)' },
      { slug: 'report.view', label: 'Xem Báo cáo doanh thu & vận hành' },
    ],
  },
  {
    group: 'Điều phối & Chuyến xe',
    items: [
      {
        slug: 'dispatch.manage',
        label: 'Điều phối xếp xe, xuất lệnh & Command Center',
      },
      { slug: 'trip.read', label: 'Xem danh sách chuyến & lộ trình' },
      { slug: 'trip.write', label: 'Tạo/sửa lô chuyến (Trip_Batches)' },
    ],
  },
  {
    group: 'Vé hành khách & Tổng đài',
    items: [
      { slug: 'booking.read', label: 'Tra cứu đơn vé hành khách' },
      { slug: 'booking.write', label: 'Tạo/sửa/hủy vé & xác nhận thu tiền' },
      { slug: 'support.manage', label: 'Xử lý yêu cầu hỗ trợ & Tổng đài CSKH' },
    ],
  },
  {
    group: 'Hàng hóa & Đối soát COD',
    items: [
      { slug: 'cargo.read', label: 'Xem vận đơn ký gửi hàng hóa' },
      { slug: 'cargo.write', label: 'Tạo/sửa/bàn giao vận đơn ký gửi' },
      { slug: 'cod.reconcile', label: 'Đối soát & thu quỹ COD tài xế' },
    ],
  },
  {
    group: 'Đội xe, Tài xế & Khách hàng',
    items: [
      { slug: 'fleet.read', label: 'Xem danh sách phương tiện' },
      { slug: 'fleet.write', label: 'Thêm/sửa/lưu trữ phương tiện' },
      { slug: 'driver.read', label: 'Xem hồ sơ tài xế' },
      { slug: 'driver.write', label: 'Tạo/sửa/khóa tài xế & cấp mật khẩu' },
      { slug: 'customer.read', label: 'Xem danh sách khách hàng CRM' },
      { slug: 'customer.write', label: 'Sửa thông tin & nhãn khách hàng' },
    ],
  },
  {
    group: 'Tài chính & Quản trị hệ thống',
    items: [
      { slug: 'finance.read', label: 'Xem sổ quỹ thu/chi' },
      { slug: 'finance.write', label: 'Lập & chỉnh sửa phiếu thu/chi' },
      {
        slug: 'settings.manage',
        label: 'Cấu hình tuyến, khung giờ, giá & thông báo',
      },
      { slug: 'rbac.manage', label: 'Quản lý nhân viên & phân quyền RBAC' },
      { slug: 'audit.read', label: 'Xem nhật ký kiểm toán (Audit Log)' },
    ],
  },
];

export function RbacConsoleView({
  defaultTab = 'users',
}: {
  defaultTab?: RbacTab;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();

  const urlTab = (searchParams.get('tab') as RbacTab) || defaultTab;
  const [tab, setTab] = useState<RbacTab>(
    ['users', 'roles', 'permissions', 'audit'].includes(urlTab)
      ? urlTab
      : defaultTab,
  );

  // Staff & Roles state
  const [staff, setStaff] = useState<StaffUserDto[] | undefined>(undefined);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [staffQ, setStaffQ] = useState('');
  const [staffStatus, setStaffStatus] = useState<UserStatus | ''>('');
  const [loading, setLoading] = useState(true);

  // Permission Matrix draft state: roleId -> Set<Permission>
  const [draftPerms, setDraftPerms] = useState<Record<string, Permission[]>>(
    {},
  );
  const [savingMatrix, setSavingMatrix] = useState(false);

  // Create Staff Modal
  const [createStaffOpen, setCreateStaffOpen] = useState(false);
  const [sName, setSName] = useState('');
  const [sPhone, setSPhone] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sPwd, setSPwd] = useState('NovaStaff2026');
  const [sRoleIds, setSRoleIds] = useState<string[]>([]);
  const [creatingStaff, setCreatingStaff] = useState(false);

  // Reset Staff Password Modal
  const [resetUser, setResetUser] = useState<StaffUserDto | null>(null);
  const [resetPwd, setResetPwd] = useState('');

  // Create Role Modal
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [rSlug, setRSlug] = useState('');
  const [rName, setRName] = useState('');
  const [rDesc, setRDesc] = useState('');
  const [rPerms, setRPerms] = useState<Permission[]>(['dashboard.view']);
  const [creatingRole, setCreatingRole] = useState(false);

  // Audit Log state
  const [auditLogs, setAuditLogs] = useState<AuditLogDto[] | undefined>(
    undefined,
  );
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditQ, setAuditQ] = useState('');
  const [selectedAudit, setSelectedAudit] = useState<AuditLogDto | null>(null);

  const loadRbac = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, rList] = await Promise.all([
        adminApi.staff({
          limit: 50,
          q: staffQ.trim() || undefined,
          status: staffStatus || undefined,
        }),
        adminApi.roles(),
      ]);
      setStaff(sRes.items);
      setRoles(rList);
      setDraftPerms(
        Object.fromEntries(
          rList.map((r) => [r.id, (r.permissions ?? []) as Permission[]]),
        ),
      );
      if (rList[0] && sRoleIds.length === 0) {
        setSRoleIds([rList[0].id]);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [staffQ, staffStatus, sRoleIds.length]);

  const loadAudit = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.auditLogs({
        page: auditPage,
        limit: 20,
        q: auditQ.trim() || undefined,
      });
      setAuditLogs(res.items);
      setAuditTotal(res.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [auditPage, auditQ]);

  useEffect(() => {
    if (tab === 'audit') void loadAudit();
    else void loadRbac();
  }, [tab, loadRbac, loadAudit]);

  const handleCreateStaff = async () => {
    if (!sName.trim() || !sPhone.trim() || !sPwd || sRoleIds.length === 0) {
      toast.error('Vui lòng nhập đầy đủ thông tin và chọn ít nhất 1 vai trò');
      return;
    }
    setCreatingStaff(true);
    try {
      await adminApi.createStaff({
        full_name: sName.trim(),
        phone: sPhone.trim(),
        email: sEmail.trim() || undefined,
        password: sPwd,
        role_ids: sRoleIds,
      });
      toast.success(`Đã tạo tài khoản nhân viên ${sName}`);
      setCreateStaffOpen(false);
      setSName('');
      setSPhone('');
      setSEmail('');
      await loadRbac();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể tạo nhân viên');
    } finally {
      setCreatingStaff(false);
    }
  };

  const handleCreateRole = async () => {
    if (!rSlug.trim() || !rName.trim()) {
      toast.error('Vui lòng nhập mã vai trò (slug) và tên vai trò');
      return;
    }
    setCreatingRole(true);
    try {
      await adminApi.createRole({
        slug: rSlug.trim().toLowerCase(),
        name: rName.trim(),
        description: rDesc.trim() || undefined,
        permissions: rPerms,
      });
      toast.success(`Đã tạo vai trò ${rName}`);
      setCreateRoleOpen(false);
      setRSlug('');
      setRName('');
      setRDesc('');
      await loadRbac();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể tạo vai trò');
    } finally {
      setCreatingRole(false);
    }
  };

  const handleSaveMatrix = async () => {
    setSavingMatrix(true);
    try {
      for (const role of roles) {
        if (role.slug === 'admin') continue; // super-admin keeps all permissions
        const next = draftPerms[role.id] ?? [];
        await adminApi.updateRole(role.id, { permissions: next });
      }
      toast.success('Đã lưu ma trận phân quyền thành công');
      await loadRbac();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi lưu ma trận quyền');
    } finally {
      setSavingMatrix(false);
    }
  };

  const staffColumns: ColumnsType<StaffUserDto> = useMemo(
    () => [
      {
        title: 'Nhân viên',
        key: 'user',
        render: (_, u) => (
          <div className="flex items-center gap-3">
            <Avatar name={u.full_name} size={34} />
            <div>
              <p className="text-sm font-semibold text-fg">{u.full_name}</p>
              <p className="text-xs text-fg-muted">
                {u.email || 'Chưa cập nhật email'}
              </p>
            </div>
          </div>
        ),
      },
      {
        title: 'Số điện thoại',
        dataIndex: 'phone',
        key: 'phone',
        render: (p: string) => (
          <Phone value={p} className="font-medium text-fg" />
        ),
      },
      {
        title: 'Vai trò (Roles)',
        key: 'roles',
        render: (_, u) => (
          <div className="flex flex-wrap gap-1">
            {u.roles.map((r) => (
              <Badge key={r.id} tone="brand">
                {r.name}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        title: 'Đăng nhập gần nhất',
        dataIndex: 'last_login_at',
        key: 'last_login_at',
        render: (d: string | null) => <DateTime value={d} />,
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (s: UserStatus) => <StatusTag domain="user" status={s} />,
      },
      {
        title: 'Thao tác',
        key: 'actions',
        align: 'right',
        render: (_, u) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<KeyRound className="size-3.5" />}
              onClick={() => {
                setResetUser(u);
                setResetPwd('');
              }}
            >
              Reset MK
            </Button>
            <Button
              size="sm"
              variant="ghost"
              leftIcon={
                u.status === 'LOCKED' ? (
                  <Unlock className="size-3.5" />
                ) : (
                  <Lock className="size-3.5" />
                )
              }
              onClick={async () => {
                const next = u.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
                await adminApi.updateStaff(u.id, { status: next });
                toast.success('Đã cập nhật trạng thái nhân viên');
                void loadRbac();
              }}
            >
              {u.status === 'LOCKED' ? 'Mở khóa' : 'Khóa'}
            </Button>
          </div>
        ),
      },
    ],
    [loadRbac, toast],
  );

  const auditColumns: ColumnsType<AuditLogDto> = useMemo(
    () => [
      {
        title: 'Thời gian',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (d: string) => <DateTime value={d} />,
      },
      {
        title: 'Người thực hiện',
        key: 'actor',
        render: (_, a) => (
          <span className="text-sm font-medium text-fg">
            {a.actor?.full_name ?? 'Hệ thống'}
          </span>
        ),
      },
      {
        title: 'Hành động (Action)',
        dataIndex: 'action',
        key: 'action',
        render: (act: string) => (
          <Badge tone="brand">
            <code className="font-mono text-xs">{act}</code>
          </Badge>
        ),
      },
      {
        title: 'Tài nguyên (Resource)',
        key: 'res',
        render: (_, a) => (
          <span className="font-mono text-xs text-fg-secondary">
            {a.resource}
            {a.resource_id ? ` · ${a.resource_id.slice(0, 8)}` : ''}
          </span>
        ),
      },
      {
        title: 'HTTP Status & IP',
        key: 'status',
        render: (_, a) => (
          <span className="font-mono text-xs text-fg-muted">
            {a.status_code} · {a.ip ?? '—'}
          </span>
        ),
      },
      {
        title: 'Chi tiết Payload',
        key: 'payload',
        align: 'right',
        render: (_, a) => (
          <Button size="sm" variant="ghost" onClick={() => setSelectedAudit(a)}>
            Xem JSON
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SegmentedControl<RbacTab>
          ariaLabel="Chuyên mục Phân quyền & Kiểm toán"
          value={tab}
          onChange={(next) => {
            setTab(next);
            router.replace(`/rbac?tab=${next}`);
          }}
          options={[
            {
              value: 'users',
              label: 'Người dùng nội bộ (Users)',
              icon: <Users className="size-4" />,
            },
            {
              value: 'roles',
              label: 'Vai trò (Roles)',
              icon: <ShieldCheck className="size-4" />,
            },
            {
              value: 'permissions',
              label: 'Ma trận Quyền (Permissions)',
              icon: <KeyRound className="size-4" />,
            },
            {
              value: 'audit',
              label: 'Nhật ký Audit Log',
              icon: <FileSpreadsheet className="size-4" />,
            },
          ]}
        />

        {tab === 'users' && (
          <Button
            leftIcon={<UserPlus className="size-4" />}
            onClick={() => setCreateStaffOpen(true)}
          >
            Tạo user nội bộ
          </Button>
        )}
        {tab === 'roles' && (
          <Button
            leftIcon={<Plus className="size-4" />}
            onClick={() => setCreateRoleOpen(true)}
          >
            Tạo role mới
          </Button>
        )}
        {tab === 'permissions' && (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCcw className="size-3.5" />}
              onClick={loadRbac}
            >
              Hoàn tác
            </Button>
            <Button
              size="sm"
              loading={savingMatrix}
              leftIcon={<Save className="size-3.5" />}
              onClick={handleSaveMatrix}
            >
              Lưu ma trận quyền
            </Button>
          </div>
        )}
      </div>

      {/* TAB 1: USERS (nvRbacUsers) */}
      {tab === 'users' && (
        <DataTable<StaffUserDto>
          columns={staffColumns}
          data={staff}
          rowKey="id"
          loading={loading}
          toolbar={
            <FilterBar
              search={{
                value: staffQ,
                onChange: setStaffQ,
                placeholder: 'Tìm nhân viên theo họ tên, SĐT, email…',
              }}
              actions={
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<RefreshCw className="size-3.5" />}
                  onClick={loadRbac}
                >
                  Làm mới
                </Button>
              }
            >
              <Select
                className="w-44"
                value={staffStatus}
                onChange={(v) => setStaffStatus(v)}
                options={[
                  { value: '', label: 'Mọi trạng thái' },
                  { value: 'ACTIVE', label: 'Đang hoạt động' },
                  { value: 'LOCKED', label: 'Đã khóa' },
                  { value: 'INACTIVE', label: 'Ngừng hoạt động' },
                ]}
              />
            </FilterBar>
          }
        />
      )}

      {/* TAB 2: ROLES (nvRbacRoles) */}
      {tab === 'roles' && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((r) => (
            <Card key={r.id} className="flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-fg">{r.name}</h3>
                    <code className="font-mono text-xs text-brand-fg">
                      {r.slug}
                    </code>
                  </div>
                  <Badge tone={r.is_system ? 'brand' : 'info'}>
                    {r.user_count} người dùng
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-fg-secondary">
                  {r.description || 'Vai trò phân quyền hệ thống'}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {r.permissions.slice(0, 6).map((p) => (
                    <Badge key={p} tone="neutral">
                      {p}
                    </Badge>
                  ))}
                  {r.permissions.length > 6 && (
                    <Badge tone="neutral">
                      +{r.permissions.length - 6} quyền
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border-subtle pt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<Copy className="size-3.5" />}
                  onClick={() => {
                    setRSlug(`${r.slug}_copy`);
                    setRName(`${r.name} (Bản sao)`);
                    setRDesc(r.description ?? '');
                    setRPerms(r.permissions as Permission[]);
                    setCreateRoleOpen(true);
                  }}
                >
                  Clone
                </Button>
                {!r.is_system && (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={async () => {
                      if (
                        await confirm({
                          title: `Xóa vai trò "${r.name}"?`,
                          okText: 'Xóa',
                          danger: true,
                        })
                      ) {
                        await adminApi.deleteRole(r.id);
                        toast.success('Đã xóa vai trò');
                        void loadRbac();
                      }
                    }}
                  >
                    <Trash2 className="size-4 text-danger-fg" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: PERMISSION MATRIX (nvRbacPermissions) */}
      {tab === 'permissions' && (
        <Card padding="none" className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-2 text-xs font-semibold uppercase text-fg-muted">
                <th className="px-5 py-3.5">Quyền hạn / Module</th>
                {roles.map((r) => (
                  <th key={r.id} className="px-4 py-3.5 text-center">
                    <div className="text-fg">{r.name}</div>
                    <div className="font-mono text-[10px] text-fg-muted">
                      {r.slug}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {PERMISSION_GROUPS.map((grp) => (
                <>
                  <tr key={grp.group} className="bg-surface-2/60">
                    <td
                      colSpan={roles.length + 1}
                      className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-brand-fg"
                    >
                      {grp.group}
                    </td>
                  </tr>
                  {grp.items.map((perm) => (
                    <tr key={perm.slug} className="hover:bg-surface-2/40">
                      <td className="px-5 py-3">
                        <p className="text-ui font-medium text-fg">
                          {perm.label}
                        </p>
                        <code className="font-mono text-[11px] text-fg-muted">
                          {perm.slug}
                        </code>
                      </td>
                      {roles.map((role) => {
                        const checked = (
                          draftPerms[role.id] ?? role.permissions
                        ).includes(perm.slug);
                        const isAdmin = role.slug === 'admin';
                        return (
                          <td key={role.id} className="px-4 py-3 text-center">
                            <div className="inline-flex justify-center">
                              <Checkbox
                                checked={isAdmin || checked}
                                disabled={isAdmin}
                                onChange={(e) => {
                                  const next = e.target.checked
                                    ? [
                                        ...(draftPerms[role.id] ?? []),
                                        perm.slug,
                                      ]
                                    : (draftPerms[role.id] ?? []).filter(
                                        (x) => x !== perm.slug,
                                      );
                                  setDraftPerms((prev) => ({
                                    ...prev,
                                    [role.id]: next,
                                  }));
                                }}
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* TAB 4: AUDIT LOG (nvAuditLog) */}
      {tab === 'audit' && (
        <DataTable<AuditLogDto>
          columns={auditColumns}
          data={auditLogs}
          rowKey="id"
          loading={loading}
          pagination={{
            page: auditPage,
            pageSize: 20,
            total: auditTotal,
            onChange: (p) => setAuditPage(p),
          }}
          toolbar={
            <FilterBar
              search={{
                value: auditQ,
                onChange: (v) => {
                  setAuditQ(v);
                  setAuditPage(1);
                },
                placeholder: 'Tìm theo action, resource…',
              }}
              actions={
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (!auditLogs?.length) return;
                      exportToCsv('novalimo-audit-logs.csv', auditLogs, [
                        { header: 'Thời gian', value: (r) => r.created_at },
                        {
                          header: 'Người thực hiện',
                          value: (r) => r.actor?.full_name ?? 'System',
                        },
                        { header: 'Action', value: (r) => r.action },
                        { header: 'Resource', value: (r) => r.resource },
                        { header: 'Status', value: (r) => r.status_code },
                      ]);
                    }}
                  >
                    Xuất CSV
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<RefreshCw className="size-3.5" />}
                    onClick={loadAudit}
                  >
                    Làm mới
                  </Button>
                </>
              }
            />
          }
        />
      )}

      {/* Modal: Create Staff User */}
      <Modal
        open={createStaffOpen}
        onCancel={() => setCreateStaffOpen(false)}
        title="Tạo tài khoản nhân viên nội bộ"
        footer={null}
      >
        <div className="mt-4 flex flex-col gap-4">
          <Field label="Họ và tên" required>
            {(p) => (
              <Input
                {...p}
                value={sName}
                onChange={(e) => setSName(e.target.value)}
              />
            )}
          </Field>
          <Field label="Số điện thoại (Đăng nhập)" required>
            {(p) => (
              <Input
                {...p}
                type="tel"
                value={sPhone}
                onChange={(e) => setSPhone(e.target.value)}
              />
            )}
          </Field>
          <Field label="Email">
            {(p) => (
              <Input
                {...p}
                type="email"
                value={sEmail}
                onChange={(e) => setSEmail(e.target.value)}
              />
            )}
          </Field>
          <Field label="Mật khẩu khởi tạo" required>
            {(p) => (
              <Input
                {...p}
                value={sPwd}
                onChange={(e) => setSPwd(e.target.value)}
              />
            )}
          </Field>
          <Field label="Vai trò (Roles)" required>
            {() => (
              <Select
                mode="multiple"
                className="w-full"
                value={sRoleIds}
                onChange={(v) => setSRoleIds(v)}
                options={roles.map((r) => ({ value: r.id, label: r.name }))}
              />
            )}
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCreateStaffOpen(false)}>
              Hủy
            </Button>
            <Button loading={creatingStaff} onClick={handleCreateStaff}>
              Tạo nhân viên
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Reset Staff Password */}
      <Modal
        open={Boolean(resetUser)}
        onCancel={() => setResetUser(null)}
        title={`Reset mật khẩu · ${resetUser?.full_name ?? ''}`}
        footer={null}
      >
        <div className="mt-4 flex flex-col gap-4">
          <Field label="Mật khẩu mới (≥ 8 ký tự, chữ & số)" required>
            {(p) => (
              <Input
                {...p}
                value={resetPwd}
                onChange={(e) => setResetPwd(e.target.value)}
              />
            )}
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setResetUser(null)}>
              Hủy
            </Button>
            <Button
              onClick={async () => {
                if (!resetUser || resetPwd.length < 8) return;
                await adminApi.resetStaffPassword(resetUser.id, resetPwd);
                toast.success('Đã đặt lại mật khẩu');
                setResetUser(null);
              }}
            >
              Lưu mật khẩu
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Create / Clone Role */}
      <Modal
        open={createRoleOpen}
        onCancel={() => setCreateRoleOpen(false)}
        title="Tạo vai trò (Role) mới"
        footer={null}
      >
        <div className="mt-4 flex flex-col gap-4">
          <Field label="Mã định danh (slug, chữ thường)" required>
            {(p) => (
              <Input
                {...p}
                value={rSlug}
                onChange={(e) => setRSlug(e.target.value)}
                placeholder="dispatcher_night"
              />
            )}
          </Field>
          <Field label="Tên hiển thị" required>
            {(p) => (
              <Input
                {...p}
                value={rName}
                onChange={(e) => setRName(e.target.value)}
                placeholder="Điều hành ca đêm"
              />
            )}
          </Field>
          <Field label="Mô tả">
            {(p) => (
              <Input
                {...p}
                value={rDesc}
                onChange={(e) => setRDesc(e.target.value)}
              />
            )}
          </Field>
          <Field label="Quyền hạn đi kèm">
            {() => (
              <Select
                mode="multiple"
                className="w-full"
                value={rPerms}
                onChange={(v) => setRPerms(v)}
                options={PERMISSIONS.map((p) => ({ value: p, label: p }))}
              />
            )}
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCreateRoleOpen(false)}>
              Hủy
            </Button>
            <Button loading={creatingRole} onClick={handleCreateRole}>
              Tạo vai trò
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Audit Log JSON Payload */}
      <Modal
        open={Boolean(selectedAudit)}
        onCancel={() => setSelectedAudit(null)}
        title={`Chi tiết Audit Log · ${selectedAudit?.action ?? ''}`}
        footer={null}
      >
        <pre className="mt-3 max-h-96 overflow-auto rounded-control border border-border-subtle bg-surface-2 p-4 font-mono text-xs text-fg-secondary">
          {JSON.stringify(selectedAudit?.payload ?? {}, null, 2)}
        </pre>
      </Modal>
    </div>
  );
}

export default function RbacPage() {
  return (
    <AdminShell
      title="Phân quyền (RBAC)"
      subtitle="Quản lý nhân viên · Vai trò (Roles) · Ma trận Quyền · Nhật ký Audit Log"
    >
      <Suspense fallback={null}>
        <RbacConsoleView defaultTab="users" />
      </Suspense>
    </AdminShell>
  );
}
