import { getRepository, Repository } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import AppError from '@shared/errors/AppError';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({ name, price, quantity });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const findProductbyName = await this.ormRepository.findOne({
      where: { name },
    });

    return findProductbyName;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const findProductsById = await this.ormRepository.findByIds(products);

    return findProductsById;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsData = await this.findAllById(products);

    const newProducts = productsData.map(productData => {
      const productFind = products.find(
        product => product.id === productData.id,
      );
      if (!productFind) {
        throw new AppError('Product not found');
      }

      if (productData.quantity < productFind.quantity) {
        throw new AppError('Products with no quantities');
      }
      const productUpdated = productData;

      productUpdated.quantity -= productFind.quantity;

      return productUpdated;
    });

    await this.ormRepository.save(newProducts);

    return newProducts;
  }
}

export default ProductsRepository;
