// The current deck is maintained in Canva. This command is for the local backup.
if (!process.argv.includes('--build-backup')) throw new Error('The current deck is exported from Canva. Pass --build-backup only to rebuild the earlier local design.');
await import('./build-deck-refined.mjs');
