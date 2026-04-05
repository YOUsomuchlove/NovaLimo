'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Card, Tag, Typography } from 'antd';
import { useMemo, useState } from 'react';

type BookingChip = { id: string; label: string };

const MOCK_BOOKINGS: BookingChip[] = [
  { id: 'b1', label: 'BK-1001 · HN → NB' },
  { id: 'b2', label: 'BK-1002 · 2 ghế' },
  { id: 'b3', label: 'BK-1003 · Hàng nhỏ' },
];

const ZONES = [
  { id: 'pool', title: 'Rổ chờ (batch)', hint: 'Kéo sang xe bên phải' },
  { id: 'vehicle-1', title: 'Xe 1 · 29A-12345', hint: 'Droppable — placeholder nghiệp vụ' },
  { id: 'vehicle-2', title: 'Xe 2 · 29B-99999', hint: 'Droppable — placeholder nghiệp vụ' },
] as const;

function findContainer(zones: Record<string, string[]>, itemId: string): string | null {
  for (const [zoneId, list] of Object.entries(zones)) {
    if (list.includes(itemId)) return zoneId;
  }
  return null;
}

function DraggableChip({ item }: { item: BookingChip }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none">
      <Tag
        className={`mb-2 mr-0 w-full cursor-grab border-slate-200 py-1.5 text-sm active:cursor-grabbing ${
          isDragging ? 'opacity-60' : ''
        }`}
        color="blue"
      >
        {item.label}
      </Tag>
    </div>
  );
}

function DroppableColumn({
  zoneId,
  title,
  hint,
  children,
}: {
  zoneId: string;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: zoneId });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg transition-shadow ${isOver ? 'ring-2 ring-amber-400/90 ring-offset-2' : ''}`}
    >
      <Card size="small" title={title} className="min-h-[200px] border-slate-200">
        <Typography.Text type="secondary" className="mb-3 block text-xs">
          {hint}
        </Typography.Text>
        <div className="flex flex-col gap-0">{children}</div>
      </Card>
    </div>
  );
}

export function DispatchDndDemo() {
  const initial = useMemo(() => {
    const z: Record<string, string[]> = { pool: [], 'vehicle-1': [], 'vehicle-2': [] };
    MOCK_BOOKINGS.forEach((b) => z.pool.push(b.id));
    return z;
  }, []);

  const [zones, setZones] = useState<Record<string, string[]>>(initial);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const bookingMap = useMemo(() => {
    const m = new Map<string, BookingChip>();
    MOCK_BOOKINGS.forEach((b) => m.set(b.id, b));
    return m;
  }, []);

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const dragged = String(active.id);
    const overId = String(over.id);

    let targetZone: string | null = null;
    if (zones[overId] !== undefined) {
      targetZone = overId;
    } else {
      targetZone = findContainer(zones, overId);
    }
    const sourceZone = findContainer(zones, dragged);
    if (!targetZone || !sourceZone) return;
    if (sourceZone === targetZone) return;

    setZones((prev) => {
      const next: Record<string, string[]> = { ...prev };
      next[sourceZone] = prev[sourceZone].filter((id) => id !== dragged);
      next[targetZone!] = [...prev[targetZone!], dragged];
      return next;
    });
  };

  const activeItem = activeId ? bookingMap.get(activeId) : null;

  return (
    <div>
      <Typography.Paragraph type="secondary" className="!mb-4">
        Demo kéo thả (@dnd-kit): booking từ <strong>Rổ chờ</strong> sang <strong>Xe</strong>. Dữ liệu giả — khi nối API
        thật sẽ thay bằng batch/ghế thực tế.
      </Typography.Paragraph>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 md:grid-cols-3">
          {ZONES.map((z) => (
            <DroppableColumn key={z.id} zoneId={z.id} title={z.title} hint={z.hint}>
              {zones[z.id]?.map((id) => {
                const item = bookingMap.get(id);
                return item ? <DraggableChip key={id} item={item} /> : null;
              })}
            </DroppableColumn>
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeItem ? (
            <Tag color="blue" className="cursor-grabbing py-1.5 text-sm shadow-md">
              {activeItem.label}
            </Tag>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
