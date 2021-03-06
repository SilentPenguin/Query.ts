﻿module Query {

   /*------------------*
    *  Implementation  *
    *------------------*/

    export var from: IFrom = function <T>(array: T[]): IQuery<T> {
        var iterator: IIterator<T> = new ArrayIterator(array);
        return new Query(iterator);
    };

    //TODO: convert .only .all and .any to .has.only .has.any and .has.any

    export class Query<T> implements IQuery<T> {
        iterator: IIterator<T>;

        constructor(iterator: IIterator<T>) {
            this.iterator = iterator;
        }

        as: IAs<T> = As.call(this);
        count: ICount<T> = Count.call(this);
        first: IFirst<T> = First.call(this);
        flatten: IFlatten<T> = Flatten.call(this);
        group: IGroup<T> = Group.call(this);
        has: IHas<T> = Has.call(this);
        last: ILast<T> = Last.call(this);
        maximum: IMaximum<T> = Maximum.call(this);
        minimum: IMinimum<T> = Minimum.call(this);
        mix: IMix<T> = Mix.call(this);
        order: IOrder<T> = Order.call(this);
        pair: IPair<T> = Pair.call(this);
        reverse: IReverse<T> = Reverse.call(this);
        single: ISingle<T> = Single.call(this);
        skip: ISkip<T> = Skip.call(this);
        take: ITake<T> = Take.call(this);
        unique: IUnique<T> = Unique.call(this);
        zip: IZip<T> = Zip.call(this);
    }

    function Has<T>(): IHas<T> {
        var object: any = {};
        object.all = All.call(this);
        object.any = Any.call(this);
        object.only = Only.call(this);
        return object;
    }

    function NotNull<T>(item: T): boolean {
        return item != null;
    }

    function All<T>(): IAll<T> {
        return (func: IFilter<T>): boolean => {
            var result: boolean = true,
                item: IIteratorResult<T>,
                func: IFilter<T> = func || NotNull;

            this.iterator.reset();

            while (!item || !item.done && result) {
                item = this.iterator.next();
                if (!item.done) {
                    result = Boolean(func(item.value));
                }
            }

            return result;
        }
    }

    function Any<T>(): IAny<T> {
        return (func?: IFilter<T>): boolean => {
            var iterator: IIterator<T> = func == null ? this.iterator : new FilterIterator(this.iterator, func);
            return !iterator.next(true).done;
        };
    }

    function As<T>(): IAs<T> {
        var object: any = <TOut>(func: IConverter<T, TOut>): IQuery<TOut> => {
            var iterator: IIterator<TOut> = new ConvertIterator(this.iterator, func);
            return new Query(iterator);
        }
        object.array = AsArray.call(this);
        return object;
    }

    function AsArray<T>(): IAsArray<T> {
        return (): T[] => this.iterator.all();
    }

    function Count<T>(): ICount<T> {
        return (): number => {
            var item: IIteratorResult<T>,
                count: number = 0;

            this.iterator.reset();

            while (!item || !item.done) {
                item = this.iterator.next();
                count += Number(!item.done);
            }

            return count;
        }
    }

    function First<T>(): IFirst<T> {
        return (): T => {
            var item: IIteratorResult<T> = this.iterator.next(true);
            return item.done ? null : item.value;
        }
    }

    function Flatten<T>(): IFlatten<T> {
        return <TOut>(func?: IConverter<T, any>): IQuery<TOut> => {
            var iterator: IIterator<TOut> = new FlattenIterator<T, TOut>(this.iterator, func != null ? func : item => item);
            return new Query(iterator);
        };
    }

    function Group<T>(): IGroup<T> {
        return { by: GroupBy.call(this) };
    }

    function GroupBy<T>(): IGroupBy<T> {
        return <TKey>(func: IConverter<T, TKey>): IQuery<IGrouping <TKey, T>> => {
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

    function Last<T>(): ILast<T> {
        return (): T => {
            var array: T[] = this.iterator.all();
            return array.length ? array.pop() : null;
        }
    }

    function Maximum<T>(): IMaximum<T> {
        var object: any = (): IQuery<T> => {
            return this.maximum.by(item => item);
        }
        object.by = MaximumBy.call(this);
        return object;
    }

    function MaximumBy<T>(): IMaximumBy<T> {
        return <TKey>(func: IConverter<T, TKey>): IQuery<T> => {
            var item: IIteratorResult<T>,
                max: TKey,
                iterator: IIterator<T>;

            this.iterator.reset();

            while (!item || !item.done) {
                item = this.iterator.next();
                if (!item.done && (max == null || max < func(item.value))) {
                    max = func(item.value);
                }
            }

            iterator = new EqualIterator(this.iterator, max, func);
            return new Query(iterator);
        }
    }

    function Minimum<T>(): IMaximum<T> {
        var object: any = (): IQuery<T> => {
            return this.minimum.by(item => item);
        }
        object.by = MinimumBy.call(this);
        return object;
    }

    function MinimumBy<T>(): IMinimumBy<T> {
        return <TKey>(func: IConverter<T, TKey>): IQuery<T> => {
            var item: IIteratorResult<T>,
                min: TKey,
                iterator: IIterator<T>;

            this.iterator.reset();

            while (!item || !item.done) {
                item = this.iterator.next();
                if (!item.done && (min == null || min > func(item.value))) {
                    min = func(item.value);
                }
            }

            iterator = new EqualIterator(this.iterator, min, func);
            return new Query(iterator);
        }
    }

    function Mix<T>(): IMix<T> {
        return { with: MixWith.call(this) };
    }

    function MixWith<T>(): IMixWith<T> {
        return (array: any): IQuery<T> => {
            var arrayIterator: IIterator<T> = array.iterator != null ? array.iterator : new ArrayIterator(array),
                iterator: IIterator<T> = new MixIterator(this.iterator, arrayIterator);
            return new Query(iterator);
        };
    }

    function Only<T>(): IOnly<T> {
        return (func?: IFilter<T>): boolean => {
            var iterator: IIterator<T> = func == null ? this.iterator : new FilterIterator(this.iterator, func);
            return !iterator.next(true).done && iterator.next().done;
        }
    }

    function Order<T>(): IOrder<T> {
        var object: any = (): IOrdered<T> => {
            return this.order.by(item => item);
        };
        object.by = OrderBy.call(this);
        return object;
    }

    function OrderBy<T>(): IOrderBy<T> {
        return <TKey>(func: IConverter<T, TKey>): IOrdered<T> => {
            var iterator: IIterator<T> = new OrderIterator(this.iterator, func);
            return new Ordered(iterator);
        };
    }

    class Ordered<T> extends Query<T> implements IOrdered<T>
    {
        then: IOrder<T> = Order.call(this);
        constructor(iterator: IIterator<T>) { super(iterator) }
    }

    function Pair<T>(): IPair<T> {
        return { with: PairWith.call(this) };
    }

    function PairWith<T>(): IPairWith<T> {
        return <TWith>(array: any): IPairQuery<T, TWith> => {
            var arrayIterator: IIterator<TWith> = array.iterator != null ? array.iterator : new ArrayIterator(array),
                iterator: IIterator<IPairing<T, TWith>> = new PairIterator<T, TWith>(this.iterator, arrayIterator);
            return new PairQuery(iterator);
        };
    }

    class Pairing<T, TWith> implements IPairing<T, TWith> {
        source: T;
        target: TWith;
        constructor(source: T, target: TWith) { this.source = source; this.target = target; }
    }

    class PairQuery<T, TWith> extends Query<IPairing<T, TWith>> implements IPairQuery<T, TWith> {
        if: IIf<IPairing<T, TWith>> = TakeIf.call(this);
        constructor(iterator: IIterator<IPairing<T, TWith>>) { super(iterator) }
    }

    function Reverse<T>(): IReverse<T> {
        return (): IQuery<T> => {
            var iterator: IIterator<T> = new ReverseIterator<T>(this.iterator);
            return new Query(iterator);
        }
    }

    function Single<T>(): ISingle<T> {
        return (): T => {
            var item: IIteratorResult<T> = this.iterator.next(true),
                done: boolean = this.iterator.next().done,
                value: T = done ? item.value : null;
            return value;
        }
    }

    function Skip<T>(): ITake<T> {
        var object: any = (count: number) => {
            var iterator = new FilterIterator(this.iterator,(item: T, index: number) => index >= count);
            return new Query(iterator);
        }
        object.if = SkipIf.call(this);
        object.while = SkipWhile.call(this);
        object.until = SkipUntil.call(this);
        return object;
    }

    function SkipIf<T>(base?: boolean): IIf<T> {
        var object: any = (func: IFilter<T>): IQuery<T> => {
            var iterator = new FilterIterator(this.iterator, (item: T) => !func(item));
            return new Query(iterator);
        };
        if (!base) {
            object.not = TakeIf.call(this, true);
        }
        return object;
    }

    function SkipWhile<T>(base?: boolean): IWhile<T> {
        var object: any = (func: IFilter<T>): IQuery<T> => {
            var iterator = new SkipWhileIterator(this.iterator, func);
            return new Query(iterator);
        };
        if (!base) {
            object.not = SkipUntil.call(this, true);
        }
        return object;
    }

    function SkipUntil<T>(base?: boolean): IWhile<T> {
        var object: any = (func: IFilter<T>): IQuery<T> => {
            var iterator = new SkipUntilIterator(this.iterator, func);
            return new Query(iterator);
        };
        if (!base) {
            object.not = SkipWhile.call(this, true);
        }
        return object;
    }

    function Take<T>(): ITake<T> {
        var object: any = (count: number) => {
            var iterator = new FilterIterator(this.iterator,(item: T, index: number) => index < count);
            return new Query(iterator);
        }
        object.if = TakeIf.call(this);
        object.while = TakeWhile.call(this);
        object.until = TakeUntil.call(this);
        return object;
    }

    function TakeIf<T>(base?: boolean): IIf<T> {
        var object: any = (func: IFilter<T>): IQuery<T> => {
            var iterator = new FilterIterator(this.iterator, func);
            return new Query(iterator);
        };
        if (!base) {
            object.not = SkipIf.call(this, true);
        }
        return object;
    }

    function TakeWhile<T>(base?: boolean): IWhile<T> {
        var object: any = (func: IFilter<T>): IQuery<T> => {
            var iterator = new TakeWhileIterator(this.iterator, func);
            return new Query(iterator);
        };
        if (!base) {
            object.not = TakeUntil.call(this, true);
        }
        return object;
    }

    function TakeUntil<T>(base?: boolean): IWhile<T> {
        var object: any = (func: IFilter<T>): IQuery<T> => {
            var iterator = new TakeUntilIterator(this.iterator, func);
            return new Query(iterator);
        };
        if (!base) {
            object.not = TakeWhile.call(this, true);
        }
        return object;
    }

    function Unique<T>(): IUnique<T> {
        var object: any = (): IQuery<T> => {
            var iterator: IIterator<T> = new UniqueIterator<T>(this.iterator);
            return new Query(iterator);
        };
        object.by = UniqueBy.call(this);
        return object;
    }

    function UniqueBy<T>(): IUniqueBy<T> {
        return <TKey>(func: IConverter<T, TKey>): IQuery<T> => {
            var iterator: IIterator<T> = new UniqueByIterator(this.iterator, func);
            return new Query(iterator);
        }
    }
    
    function Zip<T>(): IZip<T> {
        return { with: ZipWith.call(this) };
    }

    function ZipWith<T>(): IZipWith<T> {
        return <TWith>(array: any): IZipQuery<T, TWith> => {
            var arrayIterator: IIterator<TWith> = array.iterator != null ? array.iterator : new ArrayIterator(array),
                iterator: IIterator<IZipping<T, TWith>> = new ZipIterator<T, TWith>(this.iterator, arrayIterator);
            return new ZipQuery(iterator);
        };
    }

    class ZipQuery<T, TWith> extends Query<IZipping<T, TWith>> implements IZipQuery<T, TWith> {
        if: IIf<IZipping<T, TWith>> = TakeIf<IZipping<T, TWith>>();
        constructor(iterator: IIterator<IZipping<T, TWith>>) { super(iterator) }
    }

    class Zipping<T, TWith> extends Pairing<T, TWith> implements IPairing<T, TWith> { }

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
        next(): IIteratorResult<T> { throw Error; }
        all(): T[] {
            var item: IIteratorResult<T>,
                result: T[] = [];

            this.reset();
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

    class ArrayIterator<T> extends BaseIterator<T>
    {
        array: T[];
        index: number;
        reset(): void { this.index = 0; }
        next(reset: boolean = false): IIteratorResult<T> {
            if (reset) {
                this.reset();
            }

            var done: boolean = this.index >= this.array.length,
                value: T = done ? null : this.array[this.index++];

            return new IteratorResult(value, done);
        }
        constructor(array: T[]) {
            super();
            this.array = array;
            this.index = 0;
        }
    }

    class CombineIterator<TIn, TWith, TOut> extends ParentIterator<TIn, TOut> {
        protected otherparent: IIterator<TWith>;
        reset(): void { super.reset(); this.otherparent.reset(); }
        constructor(parent: IIterator<TIn>, otherparent: IIterator<TWith>) { super(parent); this.otherparent = otherparent; }
    }

    class ConvertIterator<TIn, TOut> extends ParentIterator<TIn, TOut>
    {
        private func: IConverter<TIn, TOut>;
        next(reset: boolean = false): IIteratorResult<TOut> {
            if (reset) {
                this.reset();
            }

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
        next(reset: boolean = false): IIteratorResult<T> {
            if (reset) {
                this.reset();
            }

            var item: IIteratorResult<T>;
            while (!item || !item.done && !this.func(item.value, this.index++)) {
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
        private items: IIterator<TOut>;
        reset(): void {
            super.reset();
            this.items = null;
        }
        next(reset: boolean = false): IIteratorResult<TOut> {
            if (reset) {
                this.reset();
            }

            var item: IIteratorResult<TIn>,
                result: IIteratorResult<TOut>,
                done: boolean;

            while (!result) {
                if (!this.items) {
                    item = this.parent.next();
                    if (item.done) {
                        result = new IteratorResult(null, true);
                        break;
                    } else {
                        this.items = new ArrayIterator(this.func(item.value));
                    }
                }

                if (this.items) {
                    result = this.items.next();
                }

                if (result.done) {
                    this.items = null;
                    result = null;
                }
            }

            return result;
        }
        constructor(parent: IIterator<TIn>, func: IConverter<TIn, TOut[]>) {
            super(parent);
            this.func = func;
            this.items = null;
        }
    }

    class GroupByIterator<T, TKey> extends ParentIterator<T, IGrouping<TKey, T>>
    {
        private func: IConverter<T, TKey>;
        private keys: TKey[];
        reset(): void { super.reset(); this.keys.length = 0; }
        next(reset: boolean = false): IIteratorResult<IGrouping<TKey, T>> {
            if (reset) {
                this.reset();
            }

            var result: IGrouping<TKey, T>,
                query: IQuery<T>,
                item: IIteratorResult<T>,
                key: TKey;

            while (!item || !item.done && !result) {
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

            return new IteratorResult(result, result == null);
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

    class EqualIterator<T, TKey> extends FilterIterator<T>
    {
        constructor(parent: IIterator<T>, key: TKey, func: IConverter<T, TKey>) {
            super(parent, (item: T) => func(item) == key);
        }
    }

    class MixIterator<T> extends CombineIterator<T, T, T>
    {
        next(reset: boolean = false): IIteratorResult<T> {
            if (reset) {
                this.reset();
            }

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
        reset(): void { super.reset(); this.items.length = 0; this.flattened = false; }
        next(reset: boolean = false): IIteratorResult<T> {
            if (reset) {
                this.reset();
            }

            var value: T,
                done: boolean;

            if (!this.flattened) {
                this.items = this.parent.all();
                this.items.sort((a:T, b: T): number => this.sort(a, b));
                this.flattened = this.items.length > 0;
            }

            done = !this.items.length;
            value = done ? null : this.items.shift();

            return new IteratorResult(value, done);
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

    class PairIterator<T, TWith> extends CombineIterator<T, TWith, IPairing<T, TWith>> {
        private outer: IIteratorResult<T>;
        reset(): void { super.reset(); this.outer = null; }
        next(reset: boolean = false): IIteratorResult<IPairing<T, TWith>> {
            if (reset) {
                this.reset();
            }

            var pair: IPairing<T, TWith>,
                done: boolean,
                inner: IIteratorResult<TWith> = this.otherparent.next();

            if (inner.done || !this.outer) {
                this.outer = this.parent.next();
                this.otherparent.reset();
                inner = this.otherparent.next();
            }

            done = this.outer.done || inner.done;
            pair = done ? null : new Pairing(this.outer.value, inner.value);

            return new IteratorResult(pair, done);
        }
        constructor(parent: IIterator<T>, otherparent: IIterator<TWith>) {
            super(parent, otherparent);
            this.outer = null;
        }
    }

    class ReverseIterator<T> extends ParentIterator<T, T> {
        items: T[]
        reset(): void { super.reset(); this.items = null; }
        next(reset: boolean = false): IIteratorResult<T> {
            if (reset) {
                this.reset();
            }

            var done: boolean,
                value: T;

            if (this.items == null) {
                this.items = this.parent.all();
            }

            done = this.items.length == 0;
            value = done ? null : this.items.pop();

            return new IteratorResult(value, done);
        }
        constructor(parent: IIterator<T>) {
            super(parent);
            this.items = null;
        }
    }

    class SkipWhileIterator<T> extends ParentIterator<T, T> {
        func: IFilter<T>;
        done: boolean;
        reset(): void { super.reset(); this.done = false; }
        next(reset: boolean = false): IIteratorResult<T> {
            if (reset) {
                this.reset();
            }

            var item: IIteratorResult<T>;
            while (!item || !this.done) {
                item = this.parent.next();
                this.done = this.done || item.done || !this.func(item.value);
            }

            return this.done ? item : new IteratorResult<T>(null, true);
        }
        constructor(parent: IIterator<T>, func: IFilter<T>) {
            super(parent);
            this.func = func;
            this.done = false;
        }
    }

    class SkipUntilIterator<T> extends SkipWhileIterator<T> {
        constructor(parent: IIterator<T>, func: IFilter<T>) {
            super(parent,(item: T) => !func(item));
        }
    }

    class TakeWhileIterator<T> extends ParentIterator<T, T> {
        func: IFilter<T>;
        done: boolean;
        reset(): void { super.reset(); this.done = false; }
        next(reset: boolean = false): IIteratorResult<T> {
            if (reset) {
                this.reset();
            }

            var item: IIteratorResult<T> = this.done ? null : this.parent.next();
            this.done = item.done || !this.func(item.value);
            return this.done ? new IteratorResult<T>(null, true) : item;
        }
        constructor(parent: IIterator<T>, func: IFilter<T>) {
            super(parent);
            this.func = func;
            this.done = false;
        }
    }

    class TakeUntilIterator<T> extends TakeWhileIterator<T> {
        constructor(parent: IIterator<T>, func: IFilter<T>) {
            super(parent, (item: T) => !func(item));
        }
    }

    class UniqueByIterator<T, TKey> extends ParentIterator<T, T> {
        func: IConverter<T, TKey>;
        items: TKey[];
        reset(): void { super.reset(); this.items.length = 0; }
        next(reset: boolean = false): IIteratorResult<T> {
            if (reset) {
                this.reset();
            }

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

    class UniqueIterator<T> extends UniqueByIterator<T, T> {
        constructor(parent: IIterator<T>) {
            super(parent, (item: T) => item);
        }
    }

    class ZipIterator<T, TWith> extends CombineIterator<T, TWith, IZipping<T, TWith>>{
        next(reset: boolean = false): IIteratorResult<IZipping<T, TWith>> {
            if (reset) {
                this.reset();
            }

            var outer: IIteratorResult<T> = this.parent.next(),
                inner: IIteratorResult<TWith> = this.otherparent.next(),
                done: boolean = inner.done || outer.done,
                value: IZipping<T, TWith> = done ? null : new Zipping(outer.value, inner.value);

            return new IteratorResult(value, done);
        }
    }

   /*------------------*
    *    Interfaces    *
    *------------------*/
    export interface IConverter<TIn, TOut> { (item: TIn): TOut; }
    export interface IFilter<T> { (item: T, index?: number): boolean }

    export interface IIterator<T> {
        all(): T[];
        next(reset?: boolean): IIteratorResult<T>;
        reset(): void;
    }

    interface IIteratorResult<TSource> {
        value: TSource;
        done: boolean;
    }

    export interface IQuery<T> {
        iterator: IIterator<T>;
        as: IAs<T>;
        count: ICount<T>;
        first: IFirst<T>;
        flatten: IFlatten<T>;
        group: IGroup<T>;
        has: IHas<T>;
        last: ILast<T>;
        maximum: IMaximum<T>;
        minimum: IMinimum<T>;
        mix: IMix<T>;
        order: IOrder<T>;
        pair: IPair<T>;
        reverse: IReverse<T>;
        single: ISingle<T>;
        skip: ISkip<T>;
        take: ITake<T>;
        unique: IUnique<T>;
        zip: IZip<T>;
    }

    interface IAny<T> {
        (func?: IFilter<T>): boolean;
    }

    interface IAll<T> {
        (func: IFilter<T>): boolean;
    }

    interface IAs<T> {
        <TOut>(func: IConverter<T, TOut>): IQuery<TOut>;
        array: IAsArray<T>;
    }

    interface IAsArray<T> {
        (): T[];
    }

    interface ICount<T> {
        (): number;
    }

    interface IFirst<T> {
        (): T;
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
        (func: IFilter<T>): IQuery<T>;
        not: INot<T>;
    }

    interface IHas<T> {
        all: IAll<T>;
        any: IAny<T>;
        only: IOnly<T>;
    }

    interface ILast<T> {
        (): T;
    }

    interface IMaximum<T> {
        (): IQuery<T>;
        by: IMaximumBy<T>;
    }

    interface IMaximumBy<T> {
        <TKey>(func: IConverter<T, TKey>): IQuery<T>;
    }

    interface IMinimum<T> {
        (): IQuery<T>;
        by: IMinimumBy<T>;
    }

    interface IMinimumBy<T> {
        <TKey>(func: IConverter<T, TKey>): IQuery<T>;
    }

    interface IMix<T> {
        with: IMixWith<T>;
    }

    interface IMixWith<T> {
        (array: T[]): IQuery<T>;
        (array: IQuery<T>): IQuery<T>;
    }

    interface INot<T> {
        (func: IFilter<T>): IQuery<T>;
    }

    interface IOnly<T> {
        (func?: IFilter<T>): boolean;
    }

    interface IOrder<T> {
        (): IOrdered<T>;
        by: IOrderBy<T>;
    }

    interface IOrderBy<T> {
        <TKey>(func: IConverter<T, TKey>): IOrdered<T>;
    }

    interface IOrdered<T> extends IQuery<T> {
        then: IOrder<T>;
    }

    interface IPair<T> {
        with: IPairWith<T>;
    }

    interface IPairWith<T> {
        <T, TWith>(array: TWith[]): IPairQuery<T, TWith>;
        <T, TWith>(array: IQuery<TWith>): IPairQuery<T, TWith>;
    }

    interface IPairQuery<T, TWith> extends IQuery<IPairing<T, TWith>> {
        if: IIf<IPairing<T, TWith>>;
    }

    interface IPairing<T, TWith> {
        source: T;
        target: TWith;
    }

    interface IReverse<T> {
        (): IQuery<T>;
    }

    interface ISingle<T> {
        (): T;
    }

    interface ISkip<T> {
        (count: number): IQuery<T>;
        if: IIf<T>;
        while: IWhile<T>;
        until: IUntil<T>;
    }

    interface ITake<T> {
        (count: number): IQuery<T>;
        if: IIf<T>;
        while: IWhile<T>;
        until: IUntil<T>;
    }

    interface IUnique<T> {
        (): IQuery<T>;
        by: IUniqueBy<T>;
    }

    interface IUniqueBy<T> {
        <TKey>(func: IConverter<T, TKey>): IQuery<T>;
    }

    interface IUntil<T> {
        (func: IFilter<T>): IQuery<T>;
        not: INot<T>;
    }

    interface IWhile<T> {
        (func: IFilter<T>): IQuery<T>;
        not: INot<T>;
    }

    interface IZip<T> {
        with: IZipWith<T>;
    }

    interface IZipWith<T> {
        <T, TWith>(array: TWith[]): IZipQuery<T, TWith>;
        <T, TWith>(array: IQuery<TWith>): IZipQuery<T, TWith>;
    }

    interface IZipQuery<T, TWith> extends IQuery<IZipping<T, TWith>> {
        if: IIf<IZipping<T, TWith>>;
    }

    interface IZipping<T, TWith> {
        source: T;
        target: TWith;
    }
}