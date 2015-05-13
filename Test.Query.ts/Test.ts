/// <reference path="assert.ts" />

module Test {

    /*----------------*
     *     Enums      *
     *----------------*/

    enum Intent {
        none, //normal behaviour, passes pass, fails fail, skips skip.
        pass, //pass only, passes pass, everything else fails.
        fail  //fails only, fails pass, everything else fails.
    };

    export enum State {
        none,
        pass, //test has passed
        fail, //test has failed
        skip  //test was not run
    };
        
    /*----------------*
     *   Decorators   *
     *----------------*/
    
    // @skip
    // @skip.if(boolean)
    // @skip.because(string)
    // @skip.if(boolean).because(string)

    // @test
    // @test.must.pass
    // @test.must.fail

    function SkipDecorator(): ISkipDecorator {
        var object: any = SkipIfDecorator(true);
        object.if = SkipIfDecorator;
        object.if.not = SkipIfNotDecorator;
        return object;
    }

    function SkipTest(skip: boolean = true, reason?: string): IMethodDecorator {
        if (skip) {
            return (target: Object, key: string, descriptor: TypedPropertyDescriptor<Function>) => {
                descriptor.value = () => { reason != null ? this.skip.because(reason) : this.skip(); }
            };
        } else {
            return (target: Object, key: string, descriptor: TypedPropertyDescriptor<ITest>) => {
                descriptor;
            };
        }
    }

    function SkipIfDecorator(skip: boolean, invert: boolean = false): ISkipBaseDecorator {
        var object: any = SkipTest(skip != invert);
        if (!invert) {
            object.because = SkipBecauseDecorator(skip);
        }
        return object;
    }

    function SkipIfNotDecorator(skip: boolean) {
        return SkipIfDecorator(skip, true);
    }

    function SkipBecauseDecorator(skip: boolean): ISkipBecause {
        return function (reason: string): IMethodDecorator {
            return SkipTest(skip, reason);
        }
    }

    function TakeTest(intent: Intent) {
        return (target: Object, key: string, descriptor: TypedPropertyDescriptor<ITest>) => {
            descriptor.value.intent = intent;
            return descriptor;
        }
    }

    function TestDecorator(): ITestDecorator {
        var object: any = TakeTest(Intent.none);
        object.must = TestMust();
        return object;
    }

    function TestMust(): ITestMust {
        return {
            pass: TakeTest(Intent.pass),
            fail: TakeTest(Intent.fail)
        };
    }

    export var skip: ISkipDecorator = SkipDecorator();
    export var test: ITestDecorator = TestDecorator();

    /*----------------*
     * Implementation *
     *----------------*/

    export class Set implements ISet {
        name: string;
        cases: IContainer[];

        constructor(path?: String) {
            this.name = (<any>this).constructor.name;
            this.cases = this.getCases();
        }

        getCases(): IContainer[] {
            var result: IContainer[] = [];

            for (var property in this) {
                if (this[property] instanceof Set || this[property] instanceof Case) {
                    this.add(this[property]);
                }
            }

            return result;
        }

        add(test: IContainer): void {
            this.cases.push(test);
        }

        run(): boolean {
            var result: boolean = true;
            this.cases.forEach(test => result = result && test.run());
            return result;
        }

        results(): IResult[] {
            var results: IResult[] = [];
            this.cases.forEach(test => results.concat(test.results()));
            results.forEach(result => result.path = this.name + "." + result.path);
            return results;
        }
    }

    export class Case implements ICase {
        name: string;
        fixtures: IFixture[];

        constructor(path?: string) {
            this.name = (<any>this).constructor.name;
            this.fixtures = this.getfixtures();
        }

        run(): boolean {
            var result: boolean = true;
            this.fixtures.forEach(fixture => result = result && fixture.run());
            return result;
        }

        getfixtures(): IFixture[] {
            var result: IFixture[] = [],
                propIsFunc: boolean,
                propIsTest: boolean,
                fixture: IFixture;

            for (var property in this) {
                if (this[property] instanceof Function && this[property].intent != null) {
                    fixture = new Fixture(property, this[property], this["before"], this["after"])
                    result.push(fixture);
                }
            }

            return result;
        }

        results(): IResult[] {
            var results: IResult[] = [];
            this.fixtures.forEach(fixture => results.push(fixture.results()));
            results.forEach(result => result.path = this.name + "." + result.path);
            return results;
        }
    }

    class Fixture implements IFixture {
        name: string;
        func: ITest;
        before: Function;
        after: Function;
        result: IResult;

        constructor(name: string, func: ITest, before: Function, after: Function) {
            this.name = name;
            this.func = func;
            this.func.intent = this.func.intent || Intent.none;
            this.before = before || new Function();
            this.after = after || new Function();
            this.result = new Result();
        }

        run(): boolean {
            try {
                var context = { };
                this.before.call(context);
                this.func.call(context);
                this.after.call(context);
                this.pass();
            }
            catch(exception) {
                this.fail.because(exception.message);
            }

            return this.result.state != State.fail;
        }

        pass: IPass = Pass.call(this);
        fail: IFail = Fail.call(this);
        skip: ISkip = Skip.call(this);

        results(): IResult {
            this.result.path = name;
            return this.result;
        }
    }

    class Result implements IResult {
        path: string
        state: State;
        message: string;

        constructor() {
            this.path = "";
            this.state = State.none;
            this.message = null;
        }
    }

    function Pass(): IPass {
        var object: any = (message?: string): void => {
            if (this.result.state != State.fail) {
                this.result.state = this.func.intent != Intent.fail ? State.pass : State.fail;
                this.result.message = message;
            }
        };

        object.because = object;

        return object;
    }

    function Fail(): IFail {
        var object: any = (message?: string): void => {
            if (this.result.state != State.fail) {
                this.result.state = this.func.intent != Intent.fail ? State.fail : State.pass;
                this.result.message = message;
            }
        };

        object.because = object;

        return object;
    }

    function Skip(): ISkip {
        var object: any = (message?: string): void => {
            if (this.result.state != State.fail) {
                this.result.state = this.func.intent != Intent.none ? State.skip : State.fail;
                this.result.message = message;
            }
        };

        object.because = object;

        return object;
    }

    /*----------------*
     *   Interfaces   *
     *----------------*/

    interface IRun {
        name: string;
        run(): boolean;
    }

    interface IContainer extends IRun {
        results(): IResult[];
    }

    export interface ISet extends IContainer {
        add(test: ICase): void;
    }

    export interface ICase extends IContainer { }

    interface IFixture extends IRun {
        results(): IResult;
    }

    export interface IResult {
        path: string;
        state: State;
        message: string;
    }

    interface IPass {
        (): void;
        because: IBecause;
    }

    interface IFail {
        (): void;
        because: IBecause;
    }

    interface ISkip {
        (): void;
        because: IBecause;
    }

    interface IBecause {
        (reason: string): void;
    }

    interface ITest {
        (): void;
        intent: Intent;
    }

    interface IMethodDecorator {
        (target, key, descriptor);
    }

    interface ITestDecorator extends IMethodDecorator {
        must: ITestMust;
    }

    interface ITestMust {
        pass: IMethodDecorator;
        fail: IMethodDecorator;
    }

    interface ISkipBaseDecorator extends IMethodDecorator {
        because: ISkipBecause;
    }

    interface ISkipDecorator extends ISkipBaseDecorator {
        if: ISkipIf;
    }

    interface ISkipBecause {
        (reason: string): IMethodDecorator;
    }

    interface ISkipIf {
        (skip: boolean): ISkipBaseDecorator;
        not: ISkipIfNot;
    }

    interface ISkipIfNot {
        (skip: boolean): ISkipBaseDecorator;
    }
}

var skip = Test.skip;
var test = Test.test;