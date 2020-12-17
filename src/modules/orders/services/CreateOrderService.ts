import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError(
        'Cliente nao existe e nao é possivel realizar compra sem cliente',
      );
    }

    const listProductsId = products.map(product => {
      return { id: product.id };
    });

    const productsByIds = await this.productsRepository.findAllById(
      listProductsId,
    );

    if (products.length !== productsByIds.length) {
      throw new AppError('um ou mais produtos invalidos');
    }

    const productOrder = productsByIds.map(productById => {
      const productQuantity = products.find(
        product => product.id === productById.id,
      );
      const total = productQuantity?.quantity || 0;
      if (total > productById.quantity) {
        throw new AppError('nao existe produto suficiente');
      }

      return {
        product_id: productById.id,
        price: productById.price,
        quantity: productQuantity?.quantity || 0,
      };
    });

    await this.productsRepository.updateQuantity(
      productsByIds.map(productById => {
        const productQuantity = products.find(
          product => product.id === productById.id,
        );
        return {
          id: productById.id,
          quantity: productById.quantity - (productQuantity?.quantity || 0),
        };
      }),
    );

    const order = await this.ordersRepository.create({
      customer,
      products: productOrder,
    });

    return order;
  }
}

export default CreateOrderService;
