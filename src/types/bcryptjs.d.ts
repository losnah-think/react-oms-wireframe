declare module 'bcryptjs' {
  export function compare(s: string, hash: string): Promise<boolean>
  export function genSaltSync(rounds?: number): string
  export function hashSync(s: string, salt: string | number): string
}
