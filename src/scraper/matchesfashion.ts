import puppeteer from 'puppeteer-extra';
import UserAgentPlugin from 'puppeteer-extra-plugin-anonymize-ua';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { getManager, getRepository } from 'typeorm';
import uuidv1 from 'uuid/v1';
import { Category } from '../entity/Category';
import { Item } from '../entity/Item';
import { ItemImage } from '../entity/ItemImage';
import { Site } from '../entity/Site';

const baseURL =
  'https://www.matchesfashion.com/womens/just-in/just-in-this-month/clothing/';

const categories = [
  'tops',
  'trousers',
  'coats',
  'denim',
  'dresses',
  'jackets',
  'jeans',
  'knitwear',
  'shorts',
  'skirts',
  'suits'
];

async function matchesfashion() {
  try {
    puppeteer.use(StealthPlugin());
    puppeteer.use(UserAgentPlugin({ makeWindows: true }));
    puppeteer.use(
      RecaptchaPlugin({
        provider: { id: '2captcha', token: 'XXXXXXX' },
        visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
      })
    );

    const browser = await puppeteer.launch({
      headless: false
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1080,
      height: 1080
    });

    await page.solveRecaptchas();

    for (let i = 0; i < categories.length; i++) {
      await page.goto(`${baseURL}${categories[i]}`, {
        waitUntil: 'networkidle0'
      });
      const close_button = await page.$('a.geoip_mfp-close');
      if (close_button) {
        await close_button.click();
      }
      const site = await getRepository(Site).findOne({
        name: 'matchesfashion'
      });
      const category = await getRepository(Category).findOne({
        name: categories[i]
      });

      const urls = await page.evaluate(() => {
        const items = document.querySelectorAll('.lister__item ');
        const result = [];
        for (let i = 0; i < items.length; i++) {
          const link = (items[i].querySelector(
            '.lister__item__image > a'
          ) as any).href;
          result.push(link);
        }
        return result;
      });

      const existingItems = await getRepository(Item)
        .createQueryBuilder('item')
        .where('item.url IN (:...urls)', { urls: [...urls] })
        .getMany();

      const existingUrls = existingItems.map(e => e.url);

      console.dir(existingUrls);

      let count = 0;
      for (let i = 0; i < urls.length; i++) {
        // const existingItem = await getRepository(Item).findOne({
        //   url: urls[i]
        // });

        if (existingUrls.indexOf(urls[i]) == -1) {
          await page.goto(urls[i], { waitUntil: 'networkidle0' });
          count++;

          if (count % 30 == 0) {
            await page.waitFor(60000);
            console.log(
              'waiting.....................................................................'
            );
          }

          var r = Math.random() * 2000 + 1000;
          await page.waitFor(r);

          const result: { [key: string]: any } = await page.evaluate(() => {
            let description = document
              .querySelector('.scroller-content > p:first-child')
              .textContent.trim();
            if (!description) {
              description = document
                .querySelector('.scroller-content > p:nth-child(2)')
                .textContent.trim();
            }

            const img_number = document.querySelectorAll(
              '.gallery-panel__carousel-wrapper .slick-slide'
            ).length;
            const img_urls = [];
            for (let i = 0; i < img_number; i++) {
              const url = (document.querySelector(
                `[data-slick-index="${i}"] img`
              ) as any).src;
              img_urls.push(url);
            }

            const brand = document
              .querySelector('h1.pdp-headline > a')
              .textContent.trim();
            const name = document
              .querySelector('span.pdp-description')
              .textContent.trim();
            const price = document
              .querySelector('p.pdp-price')
              .textContent.trim()
              .slice(1)
              .replace(',', '')
              .replace('.', '');

            return {
              description,
              brand,
              name,
              price: Number(price),
              img_urls
            };
          });

          const { description, brand, name, price, img_urls } = result;

          const item = getRepository(Item).create({
            url: page.url(),
            description,
            brand,
            name,
            price,
            fk_category_id: category.id,
            fk_site_id: site.id
          });

          const newItem = await getRepository(Item).save(item);

          await getManager()
            .createQueryBuilder()
            .insert()
            .into(ItemImage)
            .values(
              img_urls.map(url => {
                return { id: uuidv1(), url, fk_item_id: newItem.id };
              })
            )
            .execute();
          await page.goBack();
          await page.waitFor(2000);
        } else {
        }
      }

      // a = [[description, brand, name...], [...]]
      // let img_urls = [];
      // const a = items.map(item => {
      //   item.img_urls.forEach(img => {
      //     console.log('==========================');
      //     console.log(img);
      //     img_urls.push([uuidv1(), img, item.id]);
      //   });
      //   delete item.img_urls;
      //   return Object.keys(item).map(key => item[key]);
      // });
      // const question = '(?,?,?,?,?,?,?,?)';
      // let questions = '';
      // for (let i = 0; i < a.length; i++) {
      //   questions = questions + question;
      //   if (i != a.length - 1) {
      //     questions = questions + ',';
      //   }
      // }
      // const query = util.format(
      //   'INSERT INTO item (id, description, brand, name, url, price, fk_site_id, fk_category_id)' +
      //     'VALUES %s ON DUPLICATE KEY UPDATE id=VALUES(id), description=VALUES(description), brand=VALUES(brand), name=VALUES(name), url=VALUES(url), ' +
      //     'price=VALUES(price), fk_site_id=VALUES(fk_site_id), fk_category_id=VALUES(fk_category_id)',
      //   questions
      // );
      // await getRepository(Item).query(query, _.flatten(a));

      // const question2 = '(?,?,?)';
      // let questions2 = '';
      // for (let i = 0; i < img_urls.length; i++) {
      //   questions2 = questions2 + question2;
      //   if (i != img_urls.length - 1) {
      //     questions2 = questions2 + ',';
      //   }
      // }
      // const query2 = util.format(
      //   'INSERT INTO item_image (id, url, fk_item_id)' +
      //     'VALUES %s ON DUPLICATE KEY UPDATE id=VALUES(id), url=VALUES(url), fk_item_id=VALUES(fk_item_id)',
      //   questions2
      // );
      // await getRepository(ItemImage).query(query2, _.flatten(img_urls));
    }
    await browser.close();
  } catch (error) {
    console.log(error);
  }
}

export default matchesfashion;
