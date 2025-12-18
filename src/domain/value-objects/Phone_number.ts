export class PhoneNumber {
  private constructor(private readonly value: string) {}

  static create(phone: string): PhoneNumber {
    const cleaned = phone.replace(/\D/g, ''); // Remove non-digits

    if (cleaned.length < 10 || cleaned.length > 15) {
      throw new Error(`Invalid phone number: ${phone}`);
    }

    return new PhoneNumber(cleaned);
  }

  getValue(): string {
    return this.value;
  }

  // Format for display: (512) 555-1234
  format(): string {
    if (this.value.length === 10) {
      return `(${this.value.slice(0, 3)}) ${this.value.slice(3, 6)}-${this.value.slice(6)}`;
    }
    return this.value;
  }

  equals(other: PhoneNumber): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.format();
  }
}
