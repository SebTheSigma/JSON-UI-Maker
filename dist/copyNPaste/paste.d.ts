export declare class Paster {
    static paste(parent: HTMLElement, copiedElement: HTMLElement): void;
    /**
     * Creates a duplicate of a given class instance.
     *
     * This function uses the constructor of the provided instance to create a new
     * instance of the same class. It then copies all properties from the original
     * instance to the new instance using `Object.assign`.
     *
     * @param instance - The class instance to duplicate.
     * @returns A new instance of the same class with copied properties.
     */
    private static duplicateClassInstance;
}
