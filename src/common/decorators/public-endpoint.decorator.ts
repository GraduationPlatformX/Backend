import { SetMetadata } from '@nestjs/common';
import { PUBLIC_END_POINT_KEY } from '../guards/auth.guard';

export const Public = () => SetMetadata(PUBLIC_END_POINT_KEY, true);
