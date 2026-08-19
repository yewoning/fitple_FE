export const LOGIN_ID_PATTERN = /^[A-Za-z0-9]{6,12}$/;
export const PASSWORD_PATTERN =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[,!@#$%])[A-Za-z\d,!@#$%]{8,20}$/;

export const LOGIN_ID_MESSAGE = '6~12자의 영문과 숫자로 입력해주세요.';
export const PASSWORD_MESSAGE =
  '영문, 숫자, 특수문자(,!@#$%)를 포함한 8~20자로 입력해주세요.';
