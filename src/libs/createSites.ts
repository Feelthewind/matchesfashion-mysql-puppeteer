import { getRepository } from 'typeorm';
import { Site } from '../entity/Site';

async function createSites() {
  const site = new Site();
  site.currency = 'GBP';
  site.name = 'matchesfashion';
  await getRepository(Site).save(site);
}

export default createSites;
