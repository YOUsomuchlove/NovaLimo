import { CatalogModule } from './catalog/catalog.module';
import { TripsModule } from './trips/trips.module';

/** Business feature modules, registered in AppModule. */
export const FEATURE_MODULES = [CatalogModule, TripsModule];
