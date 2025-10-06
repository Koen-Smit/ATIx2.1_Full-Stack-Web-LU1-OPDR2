import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null; 
    }

    const errors: ValidationErrors = {};
    
    // Minimaal 6 karakters
    if (value.length < 6) {
      errors['minLength'] = true;
    }
    
    // Minimaal 1 hoofdletter
    if (!/[A-Z]/.test(value)) {
      errors['missingUppercase'] = true;
    }
    
    // Minimaal 1 kleine letter
    if (!/[a-z]/.test(value)) {
      errors['missingLowercase'] = true;
    }
    
    // Minimaal 1 cijfer
    if (!/[0-9]/.test(value)) {
      errors['missingNumber'] = true;
    }
    
    // Minimaal 1 speciaal teken
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      errors['missingSpecialChar'] = true;
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
  };
}