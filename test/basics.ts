import { describe, expect, test } from "@jest/globals";
import { createFunctionContext, getFunctionContext } from "../src/lib";

describe("basic functions", () => {
    test("sync context value", async () => {
        const context = createFunctionContext<number>();
        await context.run(() => {
            expect(getFunctionContext(context)).toBe(123);
        }, 123);
    });

    test("async context value", async () => {
        const context = createFunctionContext<number>();
        await context.run(async () => {
            expect(getFunctionContext(context)).toBe(123);
        }, 123);
    });

    test("async context value (with await)", async () => {
        const context = createFunctionContext<number>();
        await context.run(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
            expect(getFunctionContext(context)).toBe(123);
        }, 123);
    });
    
    test("missing context value", async () => {
        const context = createFunctionContext();
        await expect(async () => {
            /* @ts-ignore */
            await context.run(() => {});
        }).rejects.toThrow();
    });
});