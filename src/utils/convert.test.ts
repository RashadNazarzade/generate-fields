import { test, expect, describe } from 'vitest';
import { convert } from './convert.js';

describe('convert', () => {
  test('should convert a dictionary to a fields object', () => {
    const fields = convert({ name: 'name', age: 'age' });

    expect(fields).toEqual({
      NAME_FIELD: 'name',
      AGE_FIELD: 'age',
      NAME: 'name',
      AGE: 'age',
    });
  });

  test('should convert a nested dictionary to a fields object ', () => {
    const fields = convert({
      name: 'name',
      age: 'age',
      address: { street: 'street', city: 'city', state: 'state', zip: 'zip' },
    });

    expect(fields).toEqual({
      AGE: 'age',
      NAME: 'name',
      AGE_FIELD: 'age',
      NAME_FIELD: 'name',

      $ADDRESS: {
        KEY: 'address',
        STREET: 'street',
        STREET_FIELD: 'address.street',
        CITY: 'city',
        CITY_FIELD: 'address.city',
        STATE: 'state',
        STATE_FIELD: 'address.state',
        ZIP: 'zip',
        ZIP_FIELD: 'address.zip',
      },
    });
  });

  test('should convert a list to fields object', () => {
    const fields = convert({
      name: 'name',
      age: 'age',
      address: { street: 'street', city: 'city', state: 'state', zip: 'zip' },
      routes: [
        {
          name: 'name',
          age: 'age',
          innerRoutes: [{ name: 'name', age: 'age' }],
        },
      ],
    });

    expect(fields).toMatchObject({
      AGE: 'age',
      NAME: 'name',
      AGE_FIELD: 'age',
      NAME_FIELD: 'name',
      $ADDRESS: {
        KEY: 'address',
        STREET: 'street',
        STREET_FIELD: 'address.street',
        CITY: 'city',
        CITY_FIELD: 'address.city',
        STATE: 'state',
        STATE_FIELD: 'address.state',
        ZIP: 'zip',
        ZIP_FIELD: 'address.zip',
      },
      $ROUTES: {
        KEY: 'routes',
        NAME: 'name',
        AGE: 'age',
        NAME_FIELD: expect.any(Function),
        AGE_FIELD: expect.any(Function),
        $INNER_ROUTES: {
          KEY: 'innerRoutes',
          PATH: expect.any(Function),
          NAME: 'name',
          AGE: 'age',
          NAME_FIELD: expect.any(Function),
          AGE_FIELD: expect.any(Function),
        },
      },
    });
  });

  test('should convert a inner object of list to fields object', () => {
    const fields = convert({
      routes: [
        {
          places: {
            place1: 'place1',
            place2: 'place2',
          },
        },
      ],
    });

    expect(fields).toMatchObject({
      ROUTES_FIELD: () => {},
      $ROUTES: {
        KEY: 'routes',
        $PLACES: {
          KEY: 'places',
          PATH: () => {},
          PLACE1: 'place1',
          PLACE2: 'place2',
          PLACE1_FIELD: () => {},
          PLACE2_FIELD: () => {},
        },
      },
    });
  });

  test('should convert empty object', () => {
    const fields = convert({});
    expect(fields).toEqual({});
  });

  test('should convert object with single string field', () => {
    const fields = convert({ name: 'name' });
    expect(fields).toEqual({
      NAME: 'name',
      NAME_FIELD: 'name',
    });
  });

  test('should convert object with camelCase keys', () => {
    const fields = convert({
      firstName: 'firstName',
      lastName: 'lastName',
      userAge: 'userAge',
    });

    expect(fields).toEqual({
      FIRST_NAME: 'firstName',
      FIRST_NAME_FIELD: 'firstName',
      LAST_NAME: 'lastName',
      LAST_NAME_FIELD: 'lastName',
      USER_AGE: 'userAge',
      USER_AGE_FIELD: 'userAge',
    });
  });

  test('should convert object with array at top level', () => {
    const fields = convert([
      {
        id: 'id',
        name: 'name',
      },
    ]);

    expect(fields).toMatchObject({
      ID: 'id',
      NAME: 'name',
      ID_FIELD: () => {},
      NAME_FIELD: () => {},
    });

    expect(fields.ID_FIELD()).toBe('.id');
    expect(fields.NAME_FIELD()).toBe('.name');
  });

  test('should convert array with nested arrays (multi-level lists)', () => {
    const fields = convert({
      matrix: [
        [
          {
            value: 'value',
          },
        ],
      ],
    });

    expect(fields).toMatchObject({
      $MATRIX: {
        KEY: 'matrix',
      },
    });

    expect(fields.MATRIX_FIELD()).toBe('.matrix');
  });

  test('should convert object with nested object containing array', () => {
    const fields = convert({
      user: {
        name: 'name',
        tags: [{ value: 'value' }],
      },
    });

    expect(fields).toMatchObject({
      $USER: {
        KEY: 'user',
        NAME: 'name',
        NAME_FIELD: 'user.name',
        $TAGS: {
          KEY: 'tags',
          VALUE: 'value',
        },
      },
    });

    expect(fields.$USER.TAGS_FIELD()).toBe('user.tags');
    expect(typeof fields.$USER.$TAGS.PATH).toBe('function');
    expect(fields.$USER.$TAGS.VALUE_FIELD(0)).toBe('user.tags.0.value');
  });

  test('should convert object with multiple arrays at same level', () => {
    const fields = convert({
      users: [{ name: 'name' }],
      posts: [{ title: 'title' }],
      comments: [{ text: 'text' }],
    });

    expect(fields).toMatchObject({
      $USERS: {
        KEY: 'users',
        NAME: 'name',
      },
      $POSTS: {
        KEY: 'posts',
        TITLE: 'title',
      },
      $COMMENTS: {
        KEY: 'comments',
        TEXT: 'text',
      },
    });

    expect(fields.USERS_FIELD()).toBe('.users');
    expect(fields.POSTS_FIELD()).toBe('.posts');
    expect(fields.COMMENTS_FIELD()).toBe('.comments');
    expect(fields.$USERS.NAME_FIELD(0)).toBe('users.0.name');
    expect(fields.$POSTS.TITLE_FIELD(1)).toBe('posts.1.title');
    expect(fields.$COMMENTS.TEXT_FIELD(2)).toBe('comments.2.text');
  });

  test('should convert deeply nested object structure', () => {
    const fields = convert({
      level1: {
        level2: {
          level3: {
            level4: {
              value: 'value',
            },
          },
        },
      },
    });

    expect(fields).toMatchObject({
      $LEVEL1: {
        KEY: 'level1',
        $LEVEL2: {
          KEY: 'level2',
          $LEVEL3: {
            KEY: 'level3',
            $LEVEL4: {
              KEY: 'level4',
              VALUE: 'value',
              VALUE_FIELD: 'level1.level2.level3.level4.value',
            },
          },
        },
      },
    });

    expect(fields.$LEVEL1.$LEVEL2.PATH).toBe('level1.level2');
    expect(fields.$LEVEL1.$LEVEL2.$LEVEL3.PATH).toBe('level1.level2.level3');
    expect(fields.$LEVEL1.$LEVEL2.$LEVEL3.$LEVEL4.PATH).toBe(
      'level1.level2.level3.level4',
    );

    expect(fields.$LEVEL1.$LEVEL2.$LEVEL3.$LEVEL4.VALUE_FIELD).toBe(
      'level1.level2.level3.level4.value',
    );
  });

  test('should convert array with deeply nested structure', () => {
    const fields = convert({
      items: [
        {
          metadata: {
            tags: [{ name: 'name', value: 'value' }],
          },
        },
      ],
    });

    expect(fields).toMatchObject({
      $ITEMS: {
        KEY: 'items',
        $METADATA: {
          KEY: 'metadata',
          $TAGS: {
            KEY: 'tags',
            NAME: 'name',
            VALUE: 'value',
          },
        },
      },
    });

    expect(fields.ITEMS_FIELD()).toBe('.items');
    expect(fields.$ITEMS.$METADATA.$TAGS.NAME_FIELD(0, 1)).toBe(
      'items.0.metadata.tags.1.name',
    );
    expect(fields.$ITEMS.$METADATA.$TAGS.VALUE_FIELD(0, 1)).toBe(
      'items.0.metadata.tags.1.value',
    );
  });

  test('should convert object with array containing objects with arrays', () => {
    const fields = convert({
      orders: [
        {
          id: 'id',
          items: [{ productId: 'productId', quantity: 'quantity' }],
        },
      ],
    });

    expect(fields).toMatchObject({
      $ORDERS: {
        KEY: 'orders',
        ID: 'id',
        $ITEMS: {
          KEY: 'items',
          PRODUCT_ID: 'productId',
          QUANTITY: 'quantity',
        },
      },
    });

    expect(fields.ORDERS_FIELD()).toBe('.orders');
    expect(fields.$ORDERS.ID_FIELD(0)).toBe('orders.0.id');

    expect(fields.$ORDERS.ITEMS_FIELD(0)).toBe('orders.0.items');

    expect(fields.$ORDERS.$ITEMS.PRODUCT_ID_FIELD(0, 1)).toBe(
      'orders.0.items.1.productId',
    );
    expect(fields.$ORDERS.$ITEMS.QUANTITY_FIELD(0, 1)).toBe(
      'orders.0.items.1.quantity',
    );
  });

  test('should convert object with mixed nested objects and arrays', () => {
    const fields = convert({
      user: {
        profile: {
          firstName: 'firstName',
          lastName: 'lastName',
        },
        addresses: [{ street: 'street', city: 'city' }],
        contacts: [
          {
            type: 'type',
            phones: [{ number: 'number' }],
          },
        ],
      },
    });

    expect(fields).toMatchObject({
      $USER: {
        KEY: 'user',
        $PROFILE: {
          KEY: 'profile',
          FIRST_NAME: 'firstName',
          FIRST_NAME_FIELD: 'user.profile.firstName',
          LAST_NAME: 'lastName',
          LAST_NAME_FIELD: 'user.profile.lastName',
        },
        $ADDRESSES: {
          KEY: 'addresses',
          STREET: 'street',
          CITY: 'city',
        },
        $CONTACTS: {
          KEY: 'contacts',
          TYPE: 'type',
          $PHONES: {
            KEY: 'phones',
            NUMBER: 'number',
          },
        },
      },
    });

    expect(fields.$USER.$ADDRESSES.PATH()).toBe('user.addresses');
    expect(fields.$USER.$ADDRESSES.STREET_FIELD(0)).toBe(
      'user.addresses.0.street',
    );
    expect(fields.$USER.$ADDRESSES.CITY_FIELD(0)).toBe('user.addresses.0.city');
    expect(fields.$USER.CONTACTS_FIELD()).toBe('user.contacts');
    expect(fields.$USER.$CONTACTS.TYPE_FIELD(0)).toBe('user.contacts.0.type');
    expect(fields.$USER.$CONTACTS.PHONES_FIELD(0)).toBe(
      'user.contacts.0.phones',
    );
    expect(fields.$USER.$CONTACTS.$PHONES.PATH(0)).toBe(
      'user.contacts.0.phones',
    );

    expect(fields.$USER.$CONTACTS.$PHONES.NUMBER_FIELD(0, 1)).toBe(
      'user.contacts.0.phones.1.number',
    );
  });

  test('should convert object with array of primitives (strings)', () => {
    const fields = convert({
      tags: [{ value: 'value' }],
    });

    expect(fields).toMatchObject({
      $TAGS: {
        KEY: 'tags',
        VALUE: 'value',
      },
    });

    expect(fields.TAGS_FIELD()).toBe('.tags');
    expect(fields.$TAGS.VALUE_FIELD(0)).toBe('tags.0.value');
  });

  test('should convert object with complex multi-level array nesting', () => {
    const fields = convert({
      data: [
        {
          rows: [
            {
              cells: [{ content: 'content' }],
            },
          ],
        },
      ],
    });

    expect(fields).toMatchObject({
      $DATA: {
        KEY: 'data',
        $ROWS: {
          KEY: 'rows',
          $CELLS: {
            KEY: 'cells',
            CONTENT: 'content',
          },
        },
      },
    });

    expect(fields.DATA_FIELD()).toBe('.data');

    expect(fields.$DATA.ROWS_FIELD(0)).toBe('data.0.rows');

    expect(fields.$DATA.$ROWS.CELLS_FIELD(0, 1)).toBe('data.0.rows.1.cells');
    expect(fields.$DATA.$ROWS.$CELLS.CONTENT_FIELD(0, 1, 2)).toBe(
      'data.0.rows.1.cells.2.content',
    );
  });

  test('should convert object with nested path structure', () => {
    const fields = convert({
      api: {
        endpoints: [
          {
            method: 'method',
            path: 'path',
            params: [{ name: 'name' }],
          },
        ],
      },
    });

    expect(fields).toMatchObject({
      $API: {
        KEY: 'api',
        $ENDPOINTS: {
          KEY: 'endpoints',
          METHOD: 'method',
          $PARAMS: {
            KEY: 'params',
            NAME: 'name',
          },
        },
      },
    });

    expect(fields.$API.$ENDPOINTS).toHaveProperty('PATH');
    expect(fields.$API.$ENDPOINTS.PATH).toBeDefined();

    expect(fields.$API.ENDPOINTS_FIELD()).toBe('api.endpoints');
    expect(fields.$API.$ENDPOINTS.METHOD_FIELD(0)).toBe(
      'api.endpoints.0.method',
    );
    expect(fields.$API.$ENDPOINTS.PATH_FIELD(0)).toBe('api.endpoints.0.path');

    expect(fields.$API.$ENDPOINTS.PARAMS_FIELD(0)).toBe(
      'api.endpoints.0.params',
    );

    expect(fields.$API.$ENDPOINTS.$PARAMS.NAME_FIELD(0, 1)).toBe(
      'api.endpoints.0.params.1.name',
    );
  });
});
