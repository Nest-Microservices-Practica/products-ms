import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger: Logger = new Logger(ProductsService.name);
  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected!');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;

    const total = await this.product.count({ where: { deletedAt: null } });

    const lastPage = Math.ceil(total / limit);

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { deletedAt: null },
      }),
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: { id: Number(id), deletedAt: null },
    });

    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);

    return product;
  }

  async update(updateProductDto: UpdateProductDto) {
    const { id, ...data } = updateProductDto;
    const product = await this.findOne(id);

    return this.product.update({
      where: { id: product.id },
      data,
    });
  }

  async remove(id: number) {
    const product = await this.findOne(id);

    // return this.product.delete({
    //   where: { id: product.id },
    // });

    return this.product.update({
      where: { id: product.id },
      data: { deletedAt: new Date() },
    });
  }
}
