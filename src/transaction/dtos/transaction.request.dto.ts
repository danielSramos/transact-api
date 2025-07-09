import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Type } from "class-transformer";

export class TransactionRequestDto {

    @IsNotEmpty()
    @IsString()
    id: string = '';

    @IsNotEmpty()
    @IsNumber()
    value: number = 0;

    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    dateTime: Date = new Date();;
}