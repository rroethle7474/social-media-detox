import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

@Directive({
  selector: '[appPasswordValidator]',
  standalone: true,
  providers: [{ provide: NG_VALIDATORS, useExisting: PasswordValidatorDirective, multi: true }]
})
export class PasswordValidatorDirective implements Validator {
  static validatePassword(control: AbstractControl): { [key: string]: any } | null {
    const password = control.value;
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{7,}$/;
    return regex.test(password) ? null : { 'invalidPassword': true };
  }

  validate(control: AbstractControl): { [key: string]: any } | null {
    return PasswordValidatorDirective.validatePassword(control);
  }
}
