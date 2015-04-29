module Query {

   /*------------------*
    *  Implementation  *
    *------------------*/

    export var from: IFrom;

    export class Query<T> implements IQuery<T> {
        iterator: IIterator<T>;
        constructor(iterator: IIterator<T>){ this.iterator = iterator }
        all: IAll<T> = All<T>();
        any: IAny<T> = Any<T>();
        as: IAs<T> = As<T>();
        count: ICount<T> = Count<T>();
        flatten: IFlatten<T> = Flatten<T>();
        group: IGroup<T>;
        mix: IMix<T>;
        order: IOrder<T>;
        pair: IPair<T>;
        take: ITake<T>;
        skip: ISkip<T>;
        unique: IUnique<T>;
    }

    function NotNull<T>(item: T): boolean {
        return item != null;
    }

    function All<T>(): IAll<T> {
        return function (func?: IFilter<T>): boolean {
            var result: boolean = true,
                item: IIteratorResult<boolean>,
                func: IFilter<T> = func || NotNull,
                iterator: IIterator<boolean> = new ConvertIterator<T, boolean>(this.iterator, func);

            while (!item || !item.done && result) {
                result = item.value;
                item = iterator.next();
            }

            return result;
        }
    }

    function Any<T>(): IAny<T> {
        return function (func?: IFilter<T>): boolean {
            var iterator: IIterator<T> = new FilterIterator<T>(this.iterator, func == null ? this.notNullSelector : func);
            return !iterator.next().done;
        };
    }

    function As<T>(): IAs<T> {
        return function <TOut>(func: IConverter<T, TOut>): IQuery<TOut> {
            var iterator: IIterator<TOut> = new ConvertIterator(this.iterator, func);
            return new Query(iterator);
        }
    }

    function Count<T>(): ICount<T> {
        return function (func?: IFilter<T>): number {
            var iterator: IIterator<T> = func == null ? this.iterator : new FilterIterator(this.iterator, func),
                item: IIteratorResult<T>,
                count: number = 0;

            while (!item && !item.done) {
                item = iterator.next();
                count += item.done ? 0 : 1;
            }

            return iterator.all().length;
        }
    }

    function Flatten<T>(): IFlatten<T> {
        return function <TOut>(func?: IConverter<T, any>): IQuery<TOut> {
            var iterator: IIterator<TOut> = new FlattenIterator<T, TOut>(this.iterator, func);
            return new Query(iterator);
        };
    }

    function Group<T>(): IGroup<T> {
        return { by: GroupBy<T>() };
    }

    function GroupBy<T>(): IGroupBy<T> {
        return function <TKey>(func: IConverter<T, TKey>): IQuery<IGrouping <TKey, T>> {
            var iterator: IIterator<IGrouping<TKey, T>> = new GroupIterator(this.iterator, func);
            return new Query(iterator);
        }
    }
    
    class Grouping<TKey, TValue> implements IGrouping<TKey, TValue> {
        key: TKey;
        values: IQuery<TValue>;
        constructor(key: TKey, values: IQuery<TValue>) {
            this.key = key;
            this.values = values;
        }
    }
    
   /*------------------*
    *    Iterators     *
    *------------------*/

    class IteratorResult<T> implements IIteratorResult<T> {
        value: T;
        done: boolean;
        constructor(value: T, done: boolean) {
            this.value = value;
            this.done = done;
        }
    }

    class BaseIterator<T> implements IIterator<T> {
        reset(): void { throw Error; }
        current(): IIteratorResult<T> { throw Error; }
        next(): IIteratorResult<T> { throw Error; }
        all(): T[] {
            var item: IIteratorResult<T>,
                result: T[] = [];

            while (!item || !item.done) {
                item = this.next();
                if (!item.done) {
                    result.push(item.value);
                }
            }

            return result;
        }
    }

    class ParentIterator<TIn, TOut> extends BaseIterator<TOut> {
        protected parent: IIterator<TIn>;
        reset(): void { this.parent.reset(); }
        constructor(parent: IIterator<TIn>) {
            super();
            this.parent = parent;
        }
    }

    class ConvertIterator<TIn, TOut> extends ParentIterator<TIn, TOut>
    {
        func: IConverter<TIn, TOut>;
        next(): IIteratorResult<TOut> {
            var item: IIteratorResult<TIn> = this.parent.next(),
                done: boolean = item.done,
                result: TOut = done ? null : this.func(item.value);
            return new IteratorResult(result, done);
        }
        constructor(parent: IIterator<TIn>, func: IConverter<TIn, TOut>) {
            super(parent);
            this.func = func;
        }
    }

    class FilterIterator<T> extends ParentIterator<T, T> {
        private func: IFilter<T>;
        next(): IIteratorResult<T> {
            var item: IIteratorResult<T>;
            while (!item || !item.done || !this.func(item.value)) {
                item = this.parent.next();
            }
            return item;
        }
        constructor(parent: IIterator<T>, func: IFilter<T>) {
            super(parent);
            this.func = func;
        }
    }

    class FlattenIterator<TIn, TOut> extends ParentIterator<TIn, TOut> {
        private func: IConverter<TIn, TOut[]>;
        private items: TOut[];
        next(): IIteratorResult<TOut> {
            if (!this.items.length) {
                var item: IIteratorResult<TIn> = this.parent.next();
                if (!item.done) {
                    this.items = this.func(item.value);
                }
            }
            return new IteratorResult(this.items.length ? this.items.shift() : null, !this.items.length);
        }
        reset(): void {
            this.items = null;
            super.reset();
        }
        constructor(parent: IIterator<TIn>, func: IConverter<TIn, TOut[]>) {
            super(parent);
            this.func = func;
            this.items = [];
        }
    }

    class GroupByIterator<T, TKey> extends ParentIterator<T, IGrouping<TKey, T>>
    {
        private func: IConverter<T, TKey>;
        private keys: TKey[];
        next(): IIteratorResult<IGrouping<TKey, T>> {
            var result: IGrouping<TKey, T>,
                query: IQuery<T>,
                item: IIteratorResult<T>,
                key: TKey;

            while (!item && !item.done) {
                item = this.parent.next();
                if (!item.done) {
                    key = this.func(item.value);
                    if (this.keys.indexOf(key) < 0) {
                        this.keys.push(key);
                        query = new Query(new GroupFilterIterator(this.parent, this.func, key));
                        result = new Grouping(key, query);
                    }
                }
            }

            return new IteratorResult(result, result != null);
        }
        constructor(parent: IIterator<T>, func: IConverter<T, TKey>) {
            super(parent);
            this.func = func;
            this.keys = []
        }
    }

    class GroupFilterIterator<TKey, T> extends FilterIterator<T>
    {
        constructor(parent: IIterator<T>, func: IConverter<T, TKey>, key: TKey) {
            super(parent, (item: T) => func(item) == key)
        }
    }

   /*------------------*
    *    Interfaces    *
    *------------------*/
    export interface IConverter<TIn, TOut> { (item: TIn): TOut; }
    export interface IFilter<T> extends IConverter<T, boolean> { }
    export interface ISorter<T> { (a: T, b: T): number; }

    export interface IIterator<T> {
        reset(): void;
        current(): IIteratorResult<T>;
        next(): IIteratorResult<T>;
        all(): T[];
    }

    interface IIteratorResult<TSource> {
        value: TSource;
        done: boolean;
    }

    export interface IQuery<T> {
        all: IAll<T>;
        any: IAny<T>;
        as: IAs<T>;
        count: ICount<T>;
        flatten: IFlatten<T>;
        group: IGroup<T>;
        mix: IMix<T>;
        order: IOrder<T>;
        pair: IPair<T>;
        take: ITake<T>;
        skip: ISkip<T>;
        unique: IUnique<T>;
    }

    interface IAny<T> {
        (func?: IFilter<T>): boolean;
    }

    interface IAll<T> {
        (func?: IFilter<T>): boolean;
    }

    interface IAs<TSource> {
        <T>(func?: IConverter<TSource, T>): IQuery<T>;
    }

    interface ICount<T> {
        (func?: IFilter<T>): number;
    }

    interface IFlatten<T> {
        (): IQuery<T>;
        <TOut>(func: IConverter<T, TOut[]>): IQuery<TOut>;
        <TOut>(func: IConverter<T, IQuery<TOut>>): IQuery<TOut>;
    }

    interface IFrom {
        <T>(items: T[]): IQuery<T>;
    }

    interface IGroup<T> {
        by: IGroupBy<T>;
    }

    interface IGroupBy<T> {
        <TKey>(func: IConverter<T, TKey>): IQuery<IGrouping<TKey, T>>;
    }

    interface IGrouping<TKey, TValue> {
        key: TKey;
        values: IQuery<TValue>;
    }

    interface IIf<T, TConj> {
        (func: IFilter<T>): TConj;
        not: INot<T, TConj>;
    }

    interface IMix<T> {
        with: IMixWith<T>;
    }

    interface IMixWith<T> {
        (array: T[]): IQuery<T>;
    }

    interface INot<T, TConj> {
        (func: IFilter<T>): TConj;
    }

    interface IOrder<T> {
        by: IOrderBy<T, IOrdered<T>>;
    }

    interface IOrdered<T> extends IOrder<T> {
        then: IOrder<T>;
    }

    interface IOrderBy<T, TResult> {
        (func: ISorter<T>): TResult;
    }

    interface IPair<T> {
        with: IPairWith<T>;
    }

    interface IPairWith<T> {
        <TTarget, TResult>(array: TTarget[]): IPairQuery<T, TTarget>;
    }

    interface IPairing<TSource, TTarget> {
        source: TSource;
        target: TTarget;
    }

    interface IPairQuery<TSource, TTarget> extends IQuery<IPairing<TSource, TTarget>> {
        if: <TResult>(condition: IFilter<IPairing<TSource, TTarget>>) => IQuery<IPairing<TSource, TTarget>>;
    }

    interface ITake<T> {
        (count: number): IQuery<T>;
        if: IIf<T, ITaken<T>>;
        while: IWhile<T, ITaken<T>>;
    }

    interface ITaken<T> extends IQuery<T> {
        and: ITake<T>;
        or: ITake<T>;
        then: IQuery<T>;
    }

    interface ISkip<T> {
        (count: number): IQuery<T>;
        if: IIf<T, ITaken<T>>;
        while: IWhile<T, ITaken<T>>;
    }

    interface ISkipped<T> extends IQuery<T> {
        and: ISkip<T>;
        or: ISkip<T>;
        then: IQuery<T>;
    }

    interface IUnique<T> {
        (): IQuery<T>;
        by: IUniqueBy<T>;
    }

    interface IUniqueBy<T> {
        <TKey>(func: IConverter<T, TKey>): T;
    }

    interface IWhile<T, TConj> {
        (func: IFilter<T>): TConj;
        not: INot<T, TConj>;
    }
}