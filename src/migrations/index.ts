import * as migration_20260316_050239 from './20260316_050239';
import * as migration_20260316_182703 from './20260316_182703';
import * as migration_20260316_182732 from './20260316_182732';
import * as migration_20260317_024917 from './20260317_024917';
import * as migration_20260321_145000 from './20260321_145000';
import * as migration_20260322_add_job_runs from './20260322_add_job_runs';

export const migrations = [
  {
    up: migration_20260316_050239.up,
    down: migration_20260316_050239.down,
    name: '20260316_050239',
  },
  {
    up: migration_20260316_182703.up,
    down: migration_20260316_182703.down,
    name: '20260316_182703',
  },
  {
    up: migration_20260316_182732.up,
    down: migration_20260316_182732.down,
    name: '20260316_182732',
  },
  {
    up: migration_20260317_024917.up,
    down: migration_20260317_024917.down,
    name: '20260317_024917'
  },
  {
    up: migration_20260321_145000.up,
    down: migration_20260321_145000.down,
    name: '20260321_145000'
  },
  {
    up: migration_20260322_add_job_runs.up,
    down: migration_20260322_add_job_runs.down,
    name: '20260322_add_job_runs'
  },
];

