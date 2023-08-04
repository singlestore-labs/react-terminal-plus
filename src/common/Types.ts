// Makes generic type not-inferrable - https://stackoverflow.com/a/56688073
export type NoInfer<T extends any> = [T][T extends any ? 0 : never];