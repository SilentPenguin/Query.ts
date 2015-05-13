module Assert {
    export class Assert implements IAssert {
        that: IAssertThat = AssertThat.call(this);
    }

    function AssertThat(): IAssertThat {
        var object: any = function <T>(item: T): IValueAssertion<T> {
            return new AssertionContainer([item]);
        }
        object.all = AssertAll.call(this);
        object.any = AssertAny.call(this);
        return object;
    }

    export var that: IAssertThat = AssertThat();

    function AssertAll(): IAssertAll {
        return function <T>(items: T[]): ISetAssertion<T> {
            return new AssertionContainer(items, true, true);
        }
    }

    function AssertAny(): IAssertAny {
        return function <T>(items: T[]): ISetAssertion<T> {
            return new AssertionContainer(items, false, true);
        }
    }

    class AssertionContainer<T> implements ISetAssertion<T>, IValueAssertion<T> {
        items: T[];

        is: IAssertion<T> = Assertion.call(this);
        are: IAssertion<T> = Assertion.call(this);

        every: boolean;
        message: string;

        constructor(items: T[], every: boolean = true, array = false) {
            this.items = items;
            this.every = every;
            if (array) {
                this.message = "Assert.that." + (this.every ? "all" : "any") + "(" + this.repr(items, array) + ").are.";
            } else {
                this.message = "Assert.that(" + this.repr(items, array) + ").is.";
            }
        }

        repr(items: T[], array: boolean): string {
            var obj: any = array ? items : items[0];
            var repr: string = JSON.stringify(obj);
            return repr && repr.length < 35 ? repr : obj;
        }

        assert(func: IFilter<T>, message:string, expectation: boolean) {
            var result: boolean = this.every ? this.items.every(func) : this.items.some(func);
            if (result != expectation) {
                throw new Error(this.message + (expectation ? "" : "not.") + message);
            }
        }
    }

    function Assertion<T>(): IAssertion<T> {
        var object: any = BaseAssertion.call(this, (func: Function, message: String) => this.assert(func, message, true));
        object.not = BaseAssertion.call(this, (func: Function, message: String) => this.assert(func, message, false));
        return object;
    }

    function BaseAssertion<T>(assert: Function): IBaseAssertion<T> {
        return {
            equal: AssertEqual.call(this, assert),
            exact: AssertExact.call(this, assert),
            different: AssertDifferent.call(this, assert),
            distinct: AssertDistinct.call(this, assert),

            greater: AssertGreater.call(this, assert),
            less: AssertLess.call(this, assert),

            true: AssertTrue.call(this, assert),
            false: AssertFalse.call(this, assert),
            assigned: AssertAssigned.call(this, assert),
            null: AssertNull.call(this, assert),
            undefined: AssertUndefined.call(this, assert),
            defined: AssertDefined.call(this, assert),

            match: AssertMatch.call(this, assert)
        };
    }

    function AssertEqual<T>(assert: Function): IAssertEqual<T> {
        return { to: <T>(item: T) => { assert(value => value == item, "equal.to(" + item +")"); } };
    }

    function AssertExact<T>(assert: Function): IAssertExact<T> {
        return { to: <T>(item: T) => { assert(value => value === item, "exact.to(" + item +")"); } };
    }

    function AssertDifferent<T>(assert: Function): IAssertDifferent<T> {
        return { from: <T>(item: T) => { assert(value => value != item, "different.from(" + item +")"); } };
    }

    function AssertDistinct<T>(assert: Function): IAssertDistinct<T> {
        return { from: <T>(item: T) => { assert(value => value !== item, "distinct.from(" + item +")"); } };
    }

    function AssertGreater<T>(assert: Function): IAssertGreater<T> {
        return { than: <T>(item: T) => { assert(value => value > item, "greater.than(" + item +")"); } };
    }

    function AssertLess<T>(assert: Function): IAssertLess<T> {
        return { than: <T>(item: T) => { assert(value => value < item, "less.than(" + item +")"); } };
    }

    function AssertTrue(assert: Function): IAssertFunction {
        return () => { assert(item => item, "true()") };
    }

    function AssertFalse(assert: Function): IAssertFunction {
        return () => { assert(item => !item, "false()") };
    }

    function AssertAssigned(assert: Function): IAssertFunction {
        return () => { assert(item => item != null, "assigned()") };
    }

    function AssertNull(assert: Function): IAssertFunction {
        return () => { assert(item => item == null, "null()") };
    }

    function AssertUndefined(assert: Function): IAssertFunction {
        return () => { assert(item => item == undefined, "undefined()") };
    }

    function AssertDefined(assert: Function): IAssertFunction {
        return () => { assert(item => item != undefined, "defined()") };
    }

    function AssertMatch<T>(assert: Function): IAssertMatch<T> {
        return {
            expression: (item: RegExp) => { assert(value => item.test(value), "match.expression(" + item +")"); },
            test: <T>(func: IFilter<T>) => { assert(value => func(value), "match.test(" + func +")"); }
        };
    }

    export interface IAssert {
        that: IAssertThat;
    }

    interface IAssertThat {
        <T>(item: T): IValueAssertion<T>;
        all: IAssertAll;
        any: IAssertAny;
    }

    interface IAssertAll {
        //<T>(a: T, ...items: T[]): ISetAssertion<T>;
        <T>(items: T[]): ISetAssertion<T>;
    }

    interface IAssertAny {
        //<T>(a: T, ...items: T[]): ISetAssertion<T>;
        <T>(items: T[]): ISetAssertion<T>;
    }

    interface IValueAssertion<T> {
        is: IAssertion<T>;
    }

    interface ISetAssertion<T> {
        are: IAssertion<T>;
    }

    interface IBaseAssertion<T> {
        equal: IAssertEqual<T>;
        exact: IAssertExact<T>;
        different: IAssertDifferent<T>;
        distinct: IAssertDistinct<T>;

        greater: IAssertGreater<T>;
        less: IAssertLess<T>;

        true: IAssertFunction;
        false: IAssertFunction;
        assigned: IAssertFunction;
        null: IAssertFunction;
        undefined: IAssertFunction;
        defined: IAssertFunction;

        match: IAssertMatch<T>;
    }

    interface IAssertion<T> extends IBaseAssertion<T> {
        not: IBaseAssertion<T>;
    }

    interface IAssertFunction {
        (): void;
    }

    interface IAssertEqual<T> {
        to: IAssertTo<T>;
    }

    interface IAssertExact<T> {
        to: IAssertTo<T>;
    }

    interface IAssertTo<T> {
        (item: T): void;
    }

    interface IAssertDifferent<T> {
        from: IAssertFrom<T>;
    }

    interface IAssertDistinct<T> {
        from: IAssertFrom<T>;
    }

    interface IAssertFrom<T> {
        (item: T): void;
    }

    interface IAssertGreater<T> {
        than: IAssertThan<T>;
    }

    interface IAssertLess<T> {
        than: IAssertThan<T>;
    }

    interface IAssertThan<T> {
        (item: T): void;
    }

    interface IAssertMatch<T> {
        expression: IAssertRegex;
        test: IAssertTest<T>
    }

    interface IFilter<T> {
        (item: T): boolean;
    }

    interface IAssertTest<T> {
        (filter: IFilter<T>): void;
    }

    interface IAssertRegex {
        (regex: RegExp): void;
    }
} 