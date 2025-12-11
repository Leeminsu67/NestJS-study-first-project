import {
  Contains,
  Equals,
  IsAlphanumeric,
  IsArray,
  IsBoolean,
  IsCreditCard,
  IsDate,
  IsDateString,
  IsDefined,
  IsDivisibleBy,
  IsEmpty,
  IsEnum,
  IsHexColor,
  IsIn,
  IsInt,
  IsLatLong,
  IsNegative,
  IsNotEmpty,
  IsNotIn,
  IsNumber,
  IsOptional,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// enum MovieGenre {
//   ACTION = 'action',
//   FANTASY = 'fantasy',
// }

// 이런식으로 동기 비동기 설정도 가능하다
// @ValidatorConstraint({ async: true })
@ValidatorConstraint()
class PasswordValidator implements ValidatorConstraintInterface {
  validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> | boolean {
    //비밀번호 길이는 4~8
    return value.length >= 4 && value.length <= 8;
  }
  defaultMessage?(validationArguments?: ValidationArguments): string {
    return '비밀번호의 길이는 4~8자 여야 합니다. ($value)';
  }
}

function IsPasswordValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: PasswordValidator,
    });
  };
}

export class UpdateMovieDto {
  @IsNotEmpty()
  @IsOptional()
  title?: string;
  @IsNotEmpty()
  @IsOptional()
  genre?: string;

  // 기본
  // null || undefined
  // @IsDefined()
  // @IsOptional()
  // @Equals('hello')
  // @NotEquals('hello')
  // null || undefined || ''
  // @IsEmpty()
  // @IsNotEmpty()
  // 이 값은 해당 리스트들의 값이어야함
  // @IsIn(['action', 'fantasy'])
  // @IsNotIn(['horror', 'romance'])

  // 타입
  // @IsBoolean()
  // @IsString()
  // @IsNumber()
  // @IsInt()
  // @IsArray()
  // @IsEnum(MovieGenre)
  // @IsDate()
  // @IsDateString()

  // 숫자
  // @IsDivisibleBy(2)
  // @IsPositive()
  // @IsNegative()
  // @Min(100)
  // @Max(1000)

  // 문자
  // @Contains('t')
  // @NotContains('x')
  // @IsAlphanumeric()
  // @IsCreditCard()
  // @IsHexColor()
  // @MaxLength(20)
  // @MinLength(2)
  // @IsUUID()
  // @IsLatLong()

  //커스텀
  // @Validate(PasswordValidator, { message: '커스텀 에러 메시지' })
  @IsPasswordValid({ message: '다른 메세지' })
  test: string;
}
