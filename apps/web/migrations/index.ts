import * as migration_20260824_125729 from './20260824_125729';
import * as migration_20260825_055623 from './20260825_055623';
import * as migration_20260825_062539 from './20260825_062539';

export const migrations = [
  {
    up: migration_20260824_125729.up,
    down: migration_20260824_125729.down,
    name: '20260824_125729',
  },
  {
    up: migration_20260825_055623.up,
    down: migration_20260825_055623.down,
    name: '20260825_055623',
  },
  {
    up: migration_20260825_062539.up,
    down: migration_20260825_062539.down,
    name: '20260825_062539'
  },
];
