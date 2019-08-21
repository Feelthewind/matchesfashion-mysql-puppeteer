import { getManager, getRepository } from 'typeorm';
import { Category } from '../entity/Category';

async function createCategories() {
  const firstCategory = ['clothing', 'bags'];
  const secondCategory = [
    [
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
    ],
    [
      'backpacks',
      'mini-bags',
      'micro-bags',
      'clutch-bags',
      'shoulder-bags',
      'tote-bags',
      'top-handle-bags',
      'bucket-bags',
      'cross-body-bags'
    ]
  ];

  for (let i = 0; i < firstCategory.length; i++) {
    const category = new Category();
    category.name = firstCategory[i];
    // category.parent = null;

    let category1 = await getRepository(Category).findOne({
      name: firstCategory[i]
    });
    if (!category1) {
      category1 = await getManager().save(category);
    }

    for (let j = 0; j < secondCategory[i].length; j++) {
      const category2 = new Category();
      category2.name = secondCategory[i][j];
      category2.parent = category1;

      const existingCategory = await getRepository(Category).findOne({
        name: secondCategory[i][j]
      });
      if (!existingCategory) {
        await getManager().save(category2);
      }
    }
  }

  // const category11 = new Category();
  // category11.name = 'tops';
  // category11.parent = category1;
  // await getManager().save(category11);

  // const category12 = new Category();
  // category12.name = 'trousers';
  // category12.parent = category1;
  // await getManager().save(category12);

  // for (let i = 0; i < firstCategory.length; i++) {
  //   const query =
  //     'INSERT INTO item (id, name, parentId)' +
  //     'VALUES (?,?,?) ON DUPLICATE KEY UPDATE id=VALUES(id), name=VALUES(name), parentId=VALUES(parentId)';
  //   const newCategory = await getRepository(Category).query(query, [
  //     uuidv1(),
  //     firstCategory[i],
  //     null
  //   ]);

  //   for (let j = 0; j < secondCategory[i].length; j++) {
  //     const query =
  //       'INSERT INTO item (id, name, parentId)' +
  //       'VALUES (?,?,?) ON DUPLICATE KEY UPDATE id=VALUES(id), name=VALUES(name), parentId=VALUES(parentId)';
  //     await getRepository(Category).query(query, [
  //       uuidv1(),
  //       secondCategory[j],
  //       newCategory.id
  //     ]);
  //   }
  // }
}

export default createCategories;
