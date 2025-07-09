import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Type } from "class-transformer";

export class TransactionRequestDto {

    @IsNotEmpty()
    @IsString()
    id: string;

    @IsNotEmpty()
    @IsNumber()
    value: number;

    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    dateTime: Date;
}