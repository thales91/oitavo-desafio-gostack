import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class AddColumnOrderProduct1608228738460
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'orders_products',
      new TableColumn({
        name: 'quantity',
        type: 'int',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('orders_products', 'quantity');
  }
}
