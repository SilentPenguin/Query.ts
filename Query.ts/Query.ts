module Query {

   /*------------------*
    *  Implementation  *
    *------------------*/

    export var from: IFrom;

    export class Query<T> implements IQuery<T> {
        iterator: IIterator<T>;
        constructor(iterator: IIterator<T>){ this.iterator = iterator }
        all: IAll<T>         = All<T>();
        any: IAny<T>         = Any<T>();
        as: IAs<T>           = As<T>();
        count: ICount<T>     = Count<T>();
        flatten: IFlatten<T> = Flatten<T>();
        group: IGroup<T>     = Group<T>();
        mix: IMix<T>         = Mix<T>();
        order: IOrder<T>     = Order<T>();
        pair: IPair<T>       = Pair<T>();
        take: ITake<T>       = Take<T>();
        skip: ISkip<T>       = Skip<T>();
        unique: IUnique<T>   = Unique<T>();
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
            var iterator: IIterator<IGrouping<TKey, T>> = new GroupByIterator(this.iterator, func);
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

    function Mix<T>(): IMix<T> {
        return { with: MixWith<T>() };
    }

    function MixWith<T>(): IMixWith<T> {
        return function (array: IQuery<T>): IQuery<T> {
            var iterator: IIterator<T> = new MixIterator(this.iterator, array.iterator);
            return new Query(iterator);
        };
    }

    function Order<T>(): IOrder<T> {
        return { by: OrderBy<T>() };
    }

    function OrderBy<T>(): IOrderBy<T> {
        return function <TKey>(func: IConverter<T, TKey>): IOrdered<T> {
            var iterator: IIterator<T> = new OrderIterator(this.iterator, func);
            return new Ordered(iterator);
        };
    }

    class Ordered<T> extends Query<T> implements IOrdered<T>
    {
        then: IOrder<T>;
        constructor(iterator: IIterator<T>) { super(iterator) }
    }

    function Pair<T>(): IPair<T> {
        return { with: PairWith<T>() };
    }

    function PairWith<T>(): IPairWith<T> {
        return function <T, TWith>(array: IQuery<TWith>): IPairQuery<T, TWith> {
            var iterator: IIterator<IPairing<T, TWith>> = new PairIterator<T, TWith>(this.iterator, array.iterator);
            return new PairQuery(iterator);
        };
    }

    class Pairing<TSource, TTarget> implements IPairing<TSource, TTarget> {
        source: TSource;
        target: TTarget;
        constructor(source: TSource, target: TTarget) { this.source = source; this.target = target; }
    }

    class PairQuery<T, TWith> extends Query<IPairing<T, TWith>> implements IPairQuery<T, TWith> {
        if: IIf<IPairing<T, TWith>> = TakeIf<IPairing<T, TWith>>();
        constructor(iterator: IIterator<IPairing<T, TWith>>) { super(iterator) }
    }

    function Take<T>(): ITake<T> {
        var object: any = function (count: number) {
            var iterator = new FilterIterator(this.iterator,(item: T, index: number) => index < count);
            return new Query(iterator);
        }
        object.if = TakeIf<T>();
        object.while = TakeWhile<T>();
        return object;
    }

    function TakeIf<T>(base?: boolean): IIf<T> {
        var object: any = function (func: IFilter<T>): IQuery<T> {
            var iterator = new FilterIterator(this.iterator, func);
            return new Query(iterator);
        };
        if (base) {
            object.not = SkipIf<T>(true);
        }
        return object;
    }

    function TakeWhile<T>(base?: boolean): IWhile<T> {
        var object: any = function (func: IFilter<T>): IQuery<T> {
            var iterator = new WhileIterator(this.iterator, func);
            return new Query(iterator);
        };
        if (base) {
            object.not = SkipWhile<T>(true);
        }
        return object;
    }

    function Skip<T>(): ITake<T> {
        var object: any = function (count: number) {
            var iterator = new FilterIterator(this.iterator,(item: T, index: number) => index >= count);
            return new Query(iterator);
        }
        object.if = SkipIf<T>();
        object.while = SkipWhile<T>();
        return object;
    }

    function SkipIf<T>(base?: boolean): IIf<T> {
        var object: any = function (func: IFilter<T>): IQuery<T> {
            var iterator = new FilterIterator(this.iterator, (item: T) => !func(item));
            return new Query(iterator);
        };
        if (base) {
            object.not = TakeIf<T>(true);
        }
        return object;
    }

    function SkipWhile<T>(base?: boolean): IWhile<T> {
        var object: any = function (func: IFilter<T>): IQuery<T> {
            var iterator = new WhileIterator(this.iterator, func);
            return new Query(iterator);
        };
        if (base) {
            object.not = TakeWhile<T>(true);
        }
        return object;
    }

    function Unique<T>(): IUnique<T> {
        var object: any = function (): IQuery<T> {
            var iterator: IIterator<T> = new UniqueIterator<T>(this.iterator);
            return new Query(iterator);
        };
        object.by = UniqueBy<T>();
        return object;
    }

    function UniqueBy<T>(): IUniqueBy<T> {
        return function <TKey>(func: IConverter<T, TKey>): IQuery<T> {
            var iterator: IIterator<T> = new UniqueByIterator(this.iterator, func);
            return new Query(iterator);
        }
    }
    
   /*------------------*
    *    Iterators     *
    *------------------*/

    class IteratorResult<T> implements IIteratorResult<T> {
        value: T;
        done: boolean;
        constructor(value: T, done: boolean) { this.value = value; this.done = done; }
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
        parent: IIterator<TIn>;
        reset(): void { this.parent.reset(); }
        constructor(parent: IIterator<TIn>) { super(); this.parent = parent; }
    }

    class CombineIterator<TIn, TWith, TOut> extends ParentIterator<TIn, TOut> {
        protected otherparent: IIterator<TWith>;
        reset(): void { super.reset(); this.otherparent.reset(); }
        constructor(parent: IIterator<TIn>, otherParent: IIterator<TWith>) { super(parent); this.otherparent = otherParent; }
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
        private index: number;
        reset(): void { super.reset(); this.index = 0; }
        next(): IIteratorResult<T> {
            var item: IIteratorResult<T>;
            while (!item || !item.done || !this.func(item.value, this.index++)) {
                item = this.parent.next();
            }
            return item;
        }
        constructor(parent: IIterator<T>, func: IFilter<T>) {
            super(parent);
            this.func = func;
            this.index = 0;
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
            this.keys = [];
        }
    }

    class GroupFilterIterator<TKey, T> extends FilterIterator<T>
    {
        constructor(parent: IIterator<T>, func: IConverter<T, TKey>, key: TKey) {
            super(parent,(item: T) => func(item) == key);
        }
    }

    class MixIterator<T> extends CombineIterator<T, T, T>
    {
        next(): IIteratorResult<T> {
            var item: IIteratorResult <T> = this.parent.next();

            if (item.done) {
                item = this.otherparent.next();
            }

            return item;
        }
        constructor(parent: IIterator<T>, otherparent: IIterator<T>) {
            super(parent, otherparent);
        }
    }

    class OrderIterator<T, TKey> extends ParentIterator<T, T>
    {
        orderparent: OrderIterator<T, any>;
        func: IConverter<T, TKey>;
        items: T[];
        flattened: boolean;
        reset(): void { this.items.length = 0; this.flattened = false; }
        next(): IIteratorResult<T> {
            if (!this.flattened) {
                this.items = this.parent.all();
                this.items.sort(this.sort);
                this.flattened = this.items.length > 0;
            }

            return new IteratorResult(this.items.length ? this.items.shift() : null, this.items.length > 0);
        }
        sort(a: T, b: T): number {
            var akey: TKey = this.func(a),
                bkey: TKey = this.func(b),
                result: number = this.orderparent != null ? this.orderparent.sort(a, b) : 0;
            if (!result) {
                result = (akey < bkey ? -1 : 1) * (akey == bkey ? 0 : 1);
            }
            return result;
        }
        constructor(parent: IIterator<T>, func: IConverter<T, TKey>) {
            super(parent);
            this.func = func;
            this.items = [];
            this.flattened = false;
            this.orderparent = this.parent instanceof OrderIterator ? <OrderIterator<T, any>>this.parent : null;
            this.parent = this.orderparent != null ? this.orderparent.parent : this.parent;
        }
    }

    class PairIterator<T, TWith> extends CombineIterator<T, TWith, IPairing<T, TWith>>
    {
        constructor(parent: IIterator<T>, otherparent: IIterator<TWith>) {
            super(parent, otherparent);
        }
    }

    class UniqueIterator<T> extends UniqueByIterator<T, T> {
        constructor(parent: IIterator<T>) {
            super(parent, (item: T) => item);
        }
    }

    class UniqueByIterator<T, TKey> extends ParentIterator<T, T> {
        func: IConverter<T, TKey>;
        items: TKey[];
        next(): IIteratorResult<T> {
            var item: IIteratorResult<T> = this.parent.next(),
                key: TKey;
            while (!item.done) {
                key = this.func(item.value);
                if (this.items.indexOf(key) < 0) {
                    this.items.push(key);
                    break;
                }
                item = this.parent.next();
            }

            return item;
        }
        constructor(parent: IIterator<T>, func: IConverter<T, TKey>) {
            super(parent);
            this.func = func;
            this.items = [];
        }
    }

    class WhileIterator<T> extends ParentIterator<T, T>
    {
        func: IFilter<T>;
        done: boolean;
        reset(): void { super.reset(); this.done = false; }
        next(): IIteratorResult<T> {
            var item: IIteratorResult<T> = this.done ? null : this.parent.next();
            this.done = this.done || this.func(item.value);
            return this.done ? new IteratorResult<T>(null, true) : item;
        }
        constructor(parent: IIterator<T>, func: IFilter<T>) {
            super(parent);
            this.func = func;
            this.done = false;
        }
    }

   /*------------------*
    *    Interfaces    *
    *------------------*/
    export interface IConverter<TIn, TOut> { (item: TIn): TOut; }
    export interface IFilter<T> { (item: T, index?: number): boolean }

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
        iterator: IIterator<T>;
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
        //zip: IZip<T>;
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

    interface IIf<T> {
        (func: IFilter<T>): T;
        not: INot<T>;
    }

    interface IMix<T> {
        with: IMixWith<T>;
    }

    interface IMixWith<T> {
        (array: IQuery<T>): IQuery<T>;
    }

    interface INot<T> {
        (func: IFilter<T>): IQuery<T>;
    }

    interface IOrder<T> {
        by: IOrderBy<T>;
    }

    interface IOrdered<T> extends IQuery<T> {
        then: IOrder<T>;
    }

    interface IOrderBy<T> {
        <TKey>(func: IConverter<T, TKey>): IOrdered<T>;
    }

    interface IPair<T> {
        with: IPairWith<T>;
    }

    interface IPairWith<T> {
        <T, TWith>(array: IQuery<TWith>): IPairQuery<T, TWith>;
    }

    interface IPairing<T, TWith> {
        source: T;
        target: TWith;
    }

    interface IPairQuery<T, TWith> extends IQuery<IPairing<T, TWith>> {
        if: IIf<IPairing<T, TWith>>;
    }

    interface ITake<T> {
        (count: number): IQuery<T>;
        if: IIf<T>;
        while: IWhile<T>;
    }

    interface ITaken<T> extends IQuery<T> {
        and: ITake<T>;
        or: ITake<T>;
        then: IQuery<T>;
    }

    interface ISkip<T> {
        (count: number): IQuery<T>;
        if: IIf<T>;
        while: IWhile<T>;
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
        <TKey>(func: IConverter<T, TKey>): IQuery<T>;
    }

    interface IWhile<T> {
        (func: IFilter<T>): IQuery<T>;
        not: INot<T>;
    }
}