import 'reflect-metadata';
import { createConnection } from 'typeorm';
import matchesfashion from './scraper/matchesfashion';

createConnection()
  .then(async connection => {
    // await createCategories();
    // await createSites();

    await matchesfashion();
  })
  .catch(error => console.log(error));
