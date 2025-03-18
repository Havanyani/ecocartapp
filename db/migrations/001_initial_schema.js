exports.up = function(knex) {
  return knex.schema
    .createTable('users', function(table) {
      table.uuid('id').primary();
      table.string('name').notNullable();
      table.string('email').unique().notNullable();
      table.decimal('plastic_collected').defaultTo(0);
      table.decimal('total_credits').defaultTo(0);
      table.string('level').defaultTo('Bronze');
      table.integer('points').defaultTo(0);
      table.timestamps(true, true);
    })
    .createTable('collections', function(table) {
      table.uuid('id').primary();
      table.uuid('user_id').references('users.id');
      table.datetime('scheduled_date').notNullable();
      table.string('status').defaultTo('pending');
      table.decimal('weight').nullable();
      table.decimal('credits').nullable();
      table.timestamps(true, true);
    })
    .createTable('environmental_impact', function(table) {
      table.uuid('id').primary();
      table.uuid('collection_id').references('collections.id');
      table.decimal('trees_saved');
      table.integer('bottles_recycled');
      table.decimal('water_saved');
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('environmental_impact')
    .dropTable('collections')
    .dropTable('users');
}; 