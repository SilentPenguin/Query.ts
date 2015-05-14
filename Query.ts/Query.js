var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Query;
(function (Query_1) {
    /*------------------*
     *  Implementation  *
     *------------------*/
    Query_1.from = function (array) {
        var iterator = new ArrayIterator(array);
        return new Query(iterator);
    };
    //TODO: convert .only .all and .any to .has.only .has.any and .has.any
    var Query = (function () {
        function Query(iterator) {
            this.as = As.call(this);
            this.count = Count.call(this);
            this.first = First.call(this);
            this.flatten = Flatten.call(this);
            this.group = Group.call(this);
            this.has = Has.call(this);
            this.last = Last.call(this);
            this.maximum = Maximum.call(this);
            this.minimum = Minimum.call(this);
            this.mix = Mix.call(this);
            this.order = Order.call(this);
            this.pair = Pair.call(this);
            this.reverse = Reverse.call(this);
            this.single = Single.call(this);
            this.skip = Skip.call(this);
            this.take = Take.call(this);
            this.unique = Unique.call(this);
            this.zip = Zip.call(this);
            this.iterator = iterator;
        }
        return Query;
    })();
    Query_1.Query = Query;
    function Has() {
        var object = {};
        object.all = All.call(this);
        object.any = Any.call(this);
        object.only = Only.call(this);
        return object;
    }
    function NotNull(item) {
        return item != null;
    }
    function All() {
        var _this = this;
        return function (func) {
            var result = true, item, func = func || NotNull;
            _this.iterator.reset();
            while (!item || !item.done && result) {
                item = _this.iterator.next();
                if (!item.done) {
                    result = Boolean(func(item.value));
                }
            }
            return result;
        };
    }
    function Any() {
        var _this = this;
        return function (func) {
            var iterator = func == null ? _this.iterator : new FilterIterator(_this.iterator, func);
            return !iterator.next(true).done;
        };
    }
    function As() {
        var _this = this;
        var object = function (func) {
            var iterator = new ConvertIterator(_this.iterator, func);
            return new Query(iterator);
        };
        object.array = AsArray.call(this);
        return object;
    }
    function AsArray() {
        var _this = this;
        return function () { return _this.iterator.all(); };
    }
    function Count() {
        var _this = this;
        return function () {
            var item, count = 0;
            _this.iterator.reset();
            while (!item || !item.done) {
                item = _this.iterator.next();
                count += Number(!item.done);
            }
            return count;
        };
    }
    function First() {
        var _this = this;
        return function () {
            var item = _this.iterator.next(true);
            return item.done ? null : item.value;
        };
    }
    function Flatten() {
        var _this = this;
        return function (func) {
            var iterator = new FlattenIterator(_this.iterator, func != null ? func : function (item) { return item; });
            return new Query(iterator);
        };
    }
    function Group() {
        return { by: GroupBy.call(this) };
    }
    function GroupBy() {
        var _this = this;
        return function (func) {
            var iterator = new GroupByIterator(_this.iterator, func);
            return new Query(iterator);
        };
    }
    var Grouping = (function () {
        function Grouping(key, values) {
            this.key = key;
            this.values = values;
        }
        return Grouping;
    })();
    function Last() {
        var _this = this;
        return function () {
            var array = _this.iterator.all();
            return array.length ? array.pop() : null;
        };
    }
    function Maximum() {
        var _this = this;
        var object = function () {
            return _this.maximum.by(function (item) { return item; });
        };
        object.by = MaximumBy.call(this);
        return object;
    }
    function MaximumBy() {
        var _this = this;
        return function (func) {
            var item, max, iterator;
            _this.iterator.reset();
            while (!item || !item.done) {
                item = _this.iterator.next();
                if (!item.done && (max == null || max < func(item.value))) {
                    max = func(item.value);
                }
            }
            iterator = new EqualIterator(_this.iterator, max, func);
            return new Query(iterator);
        };
    }
    function Minimum() {
        var _this = this;
        var object = function () {
            return _this.minimum.by(function (item) { return item; });
        };
        object.by = MinimumBy.call(this);
        return object;
    }
    function MinimumBy() {
        var _this = this;
        return function (func) {
            var item, min, iterator;
            _this.iterator.reset();
            while (!item || !item.done) {
                item = _this.iterator.next();
                if (!item.done && (min == null || min > func(item.value))) {
                    min = func(item.value);
                }
            }
            iterator = new EqualIterator(_this.iterator, min, func);
            return new Query(iterator);
        };
    }
    function Mix() {
        return { with: MixWith.call(this) };
    }
    function MixWith() {
        var _this = this;
        return function (array) {
            var arrayIterator = array.iterator != null ? array.iterator : new ArrayIterator(array), iterator = new MixIterator(_this.iterator, arrayIterator);
            return new Query(iterator);
        };
    }
    function Only() {
        var _this = this;
        return function (func) {
            var iterator = func == null ? _this.iterator : new FilterIterator(_this.iterator, func);
            return !iterator.next(true).done && iterator.next().done;
        };
    }
    function Order() {
        var _this = this;
        var object = function () {
            return _this.order.by(function (item) { return item; });
        };
        object.by = OrderBy.call(this);
        return object;
    }
    function OrderBy() {
        var _this = this;
        return function (func) {
            var iterator = new OrderIterator(_this.iterator, func);
            return new Ordered(iterator);
        };
    }
    var Ordered = (function (_super) {
        __extends(Ordered, _super);
        function Ordered(iterator) {
            _super.call(this, iterator);
            this.then = Order.call(this);
        }
        return Ordered;
    })(Query);
    function Pair() {
        return { with: PairWith.call(this) };
    }
    function PairWith() {
        var _this = this;
        return function (array) {
            var arrayIterator = array.iterator != null ? array.iterator : new ArrayIterator(array), iterator = new PairIterator(_this.iterator, arrayIterator);
            return new PairQuery(iterator);
        };
    }
    var Pairing = (function () {
        function Pairing(source, target) {
            this.source = source;
            this.target = target;
        }
        return Pairing;
    })();
    var PairQuery = (function (_super) {
        __extends(PairQuery, _super);
        function PairQuery(iterator) {
            _super.call(this, iterator);
            this.if = TakeIf.call(this);
        }
        return PairQuery;
    })(Query);
    function Reverse() {
        var _this = this;
        return function () {
            var iterator = new ReverseIterator(_this.iterator);
            return new Query(iterator);
        };
    }
    function Single() {
        var _this = this;
        return function () {
            var item = _this.iterator.next(true), done = _this.iterator.next().done, value = done ? item.value : null;
            return value;
        };
    }
    function Skip() {
        var _this = this;
        var object = function (count) {
            var iterator = new FilterIterator(_this.iterator, function (item, index) { return index >= count; });
            return new Query(iterator);
        };
        object.if = SkipIf.call(this);
        object.while = SkipWhile.call(this);
        object.until = SkipUntil.call(this);
        return object;
    }
    function SkipIf(base) {
        var _this = this;
        var object = function (func) {
            var iterator = new FilterIterator(_this.iterator, function (item) { return !func(item); });
            return new Query(iterator);
        };
        if (!base) {
            object.not = TakeIf.call(this, true);
        }
        return object;
    }
    function SkipWhile(base) {
        var _this = this;
        var object = function (func) {
            var iterator = new SkipWhileIterator(_this.iterator, func);
            return new Query(iterator);
        };
        if (!base) {
            object.not = SkipUntil.call(this, true);
        }
        return object;
    }
    function SkipUntil(base) {
        var _this = this;
        var object = function (func) {
            var iterator = new SkipUntilIterator(_this.iterator, func);
            return new Query(iterator);
        };
        if (!base) {
            object.not = SkipWhile.call(this, true);
        }
        return object;
    }
    function Take() {
        var _this = this;
        var object = function (count) {
            var iterator = new FilterIterator(_this.iterator, function (item, index) { return index < count; });
            return new Query(iterator);
        };
        object.if = TakeIf.call(this);
        object.while = TakeWhile.call(this);
        object.until = TakeUntil.call(this);
        return object;
    }
    function TakeIf(base) {
        var _this = this;
        var object = function (func) {
            var iterator = new FilterIterator(_this.iterator, func);
            return new Query(iterator);
        };
        if (!base) {
            object.not = SkipIf.call(this, true);
        }
        return object;
    }
    function TakeWhile(base) {
        var _this = this;
        var object = function (func) {
            var iterator = new TakeWhileIterator(_this.iterator, func);
            return new Query(iterator);
        };
        if (!base) {
            object.not = TakeUntil.call(this, true);
        }
        return object;
    }
    function TakeUntil(base) {
        var _this = this;
        var object = function (func) {
            var iterator = new TakeUntilIterator(_this.iterator, func);
            return new Query(iterator);
        };
        if (!base) {
            object.not = TakeWhile.call(this, true);
        }
        return object;
    }
    function Unique() {
        var _this = this;
        var object = function () {
            var iterator = new UniqueIterator(_this.iterator);
            return new Query(iterator);
        };
        object.by = UniqueBy.call(this);
        return object;
    }
    function UniqueBy() {
        var _this = this;
        return function (func) {
            var iterator = new UniqueByIterator(_this.iterator, func);
            return new Query(iterator);
        };
    }
    function Zip() {
        return { with: ZipWith.call(this) };
    }
    function ZipWith() {
        var _this = this;
        return function (array) {
            var arrayIterator = array.iterator != null ? array.iterator : new ArrayIterator(array), iterator = new ZipIterator(_this.iterator, arrayIterator);
            return new ZipQuery(iterator);
        };
    }
    var ZipQuery = (function (_super) {
        __extends(ZipQuery, _super);
        function ZipQuery(iterator) {
            _super.call(this, iterator);
            this.if = TakeIf();
        }
        return ZipQuery;
    })(Query);
    var Zipping = (function (_super) {
        __extends(Zipping, _super);
        function Zipping() {
            _super.apply(this, arguments);
        }
        return Zipping;
    })(Pairing);
    /*------------------*
     *    Iterators     *
     *------------------*/
    var IteratorResult = (function () {
        function IteratorResult(value, done) {
            this.value = value;
            this.done = done;
        }
        return IteratorResult;
    })();
    var BaseIterator = (function () {
        function BaseIterator() {
        }
        BaseIterator.prototype.reset = function () { throw Error; };
        BaseIterator.prototype.next = function () { throw Error; };
        BaseIterator.prototype.all = function () {
            var item, result = [];
            this.reset();
            while (!item || !item.done) {
                item = this.next();
                if (!item.done) {
                    result.push(item.value);
                }
            }
            return result;
        };
        return BaseIterator;
    })();
    var ParentIterator = (function (_super) {
        __extends(ParentIterator, _super);
        function ParentIterator(parent) {
            _super.call(this);
            this.parent = parent;
        }
        ParentIterator.prototype.reset = function () { this.parent.reset(); };
        return ParentIterator;
    })(BaseIterator);
    var ArrayIterator = (function (_super) {
        __extends(ArrayIterator, _super);
        function ArrayIterator(array) {
            _super.call(this);
            this.array = array;
            this.index = 0;
        }
        ArrayIterator.prototype.reset = function () { this.index = 0; };
        ArrayIterator.prototype.next = function (reset) {
            if (reset === void 0) { reset = false; }
            if (reset) {
                this.reset();
            }
            var done = this.index >= this.array.length, value = done ? null : this.array[this.index++];
            return new IteratorResult(value, done);
        };
        return ArrayIterator;
    })(BaseIterator);
    var CombineIterator = (function (_super) {
        __extends(CombineIterator, _super);
        function CombineIterator(parent, otherParent) {
            _super.call(this, parent);
            this.otherparent = otherParent;
        }
        CombineIterator.prototype.reset = function () { _super.prototype.reset.call(this); this.otherparent.reset(); };
        return CombineIterator;
    })(ParentIterator);
    var ConvertIterator = (function (_super) {
        __extends(ConvertIterator, _super);
        function ConvertIterator(parent, func) {
            _super.call(this, parent);
            this.func = func;
        }
        ConvertIterator.prototype.next = function (reset) {
            if (reset === void 0) { reset = false; }
            if (reset) {
                this.reset();
            }
            var item = this.parent.next(), done = item.done, result = done ? null : this.func(item.value);
            return new IteratorResult(result, done);
        };
        return ConvertIterator;
    })(ParentIterator);
    var FilterIterator = (function (_super) {
        __extends(FilterIterator, _super);
        function FilterIterator(parent, func) {
            _super.call(this, parent);
            this.func = func;
            this.index = 0;
        }
        FilterIterator.prototype.reset = function () { _super.prototype.reset.call(this); this.index = 0; };
        FilterIterator.prototype.next = function (reset) {
            if (reset === void 0) { reset = false; }
            if (reset) {
                this.reset();
            }
            var item;
            while (!item || !item.done && !this.func(item.value, this.index++)) {
                item = this.parent.next();
            }
            return item;
        };
        return FilterIterator;
    })(ParentIterator);
    var FlattenIterator = (function (_super) {
        __extends(FlattenIterator, _super);
        function FlattenIterator(parent, func) {
            _super.call(this, parent);
            this.func = func;
            this.items = null;
        }
        FlattenIterator.prototype.reset = function () {
            _super.prototype.reset.call(this);
            this.items = null;
        };
        FlattenIterator.prototype.next = function (reset) {
            if (reset === void 0) { reset = false; }
            if (reset) {
                this.reset();
            }
            var item, result, done;
            while (!result) {
                if (!this.items) {
                    item = this.parent.next();
                    if (item.done) {
                        result = new IteratorResult(null, true);
                        break;
                    }
                    else {
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
        };
        return FlattenIterator;
    })(ParentIterator);
    var GroupByIterator = (function (_super) {
        __extends(GroupByIterator, _super);
        function GroupByIterator(parent, func) {
            _super.call(this, parent);
            this.func = func;
            this.keys = [];
        }
        GroupByIterator.prototype.reset = function () { _super.prototype.reset.call(this); this.keys.length = 0; };
        GroupByIterator.prototype.next = function (reset) {
            if (reset === void 0) { reset = false; }
            if (reset) {
                this.reset();
            }
            var result, query, item, key;
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
        };
        return GroupByIterator;
    })(ParentIterator);
    var GroupFilterIterator = (function (_super) {
        __extends(GroupFilterIterator, _super);
        function GroupFilterIterator(parent, func, key) {
            _super.call(this, parent, function (item) { return func(item) == key; });
        }
        return GroupFilterIterator;
    })(FilterIterator);
    var EqualIterator = (function (_super) {
        __extends(EqualIterator, _super);
        function EqualIterator(parent, key, func) {
            _super.call(this, parent, function (item) { return func(item) == key; });
        }
        return EqualIterator;
    })(FilterIterator);
    var MixIterator = (function (_super) {
        __extends(MixIterator, _super);
        function MixIterator(parent, otherparent) {
            _super.call(this, parent, otherparent);
        }
        MixIterator.prototype.next = function (reset) {
            if (reset === void 0) { reset = false; }
            if (reset) {
                this.reset();
            }
            var item = this.parent.next();
            if (item.done) {
                item = this.otherparent.next();
            }
            return item;
        };
        return MixIterator;
    })(CombineIterator);
    var OrderIterator = (function (_super) {
        __extends(OrderIterator, _super);
        function OrderIterator(parent, func) {
            _super.call(this, parent);
            this.func = func;
            this.items = [];
            this.flattened = false;
            this.orderparent = this.parent instanceof OrderIterator ? this.parent : null;
            this.parent = this.orderparent != null ? this.orderparent.parent : this.parent;
        }
        OrderIterator.prototype.reset = function () { _super.prototype.reset.call(this); this.items.length = 0; this.flattened = false; };
        OrderIterator.prototype.next = function (reset) {
            var _this = this;
            if (reset === void 0) { reset = false; }
            if (reset) {
                this.reset();
            }
            var value, done;
            if (!this.flattened) {
                this.items = this.parent.all();
                this.items.sort(function (a, b) { return _this.sort(a, b); });
                this.flattened = this.items.length > 0;
            }
            done = !this.items.length;
            value = done ? null : this.items.shift();
            return new IteratorResult(value, done);
        };
        OrderIterator.prototype.sort = function (a, b) {
            var akey = this.func(a), bkey = this.func(b), result = this.orderparent != null ? this.orderparent.sort(a, b) : 0;
            if (!result) {
                result = (akey < bkey ? -1 : 1) * (akey == bkey ? 0 : 1);
            }
            return result;
        };
        return OrderIterator;
    })(ParentIterator);
    var PairIterator = (function (_super) {
        __extends(PairIterator, _super);
        function PairIterator(parent, otherparent) {
            _super.call(this, parent, otherparent);
            this.outer = null;
        }
        PairIterator.prototype.reset = function () { _super.prototype.reset.call(this); this.outer = null; };
        PairIterator.prototype.next = function (reset) {
            if (reset === void 0) { reset = false; }
            if (reset) {
                this.reset();
            }
            var pair, done, inner = this.otherparent.next();
            if (inner.done || !this.outer) {
                this.outer = this.parent.next();
                this.otherparent.reset();
                inner = this.otherparent.next();
            }
            done = this.outer.done || inner.done;
            pair = done ? null : new Pairing(this.outer.value, inner.value);
            return new IteratorResult(pair, done);
        };
        return PairIterator;
    })(CombineIterator);
    var ReverseIterator = (function (_super) {
        __extends(ReverseIterator, _super);
        function ReverseIterator(parent) {
            _super.call(this, parent);
            this.items = null;
        }
        ReverseIterator.prototype.reset = function () { _super.prototype.reset.call(this); this.items = null; };
        ReverseIterator.prototype.next = function (reset) {
            if (reset === void 0) { reset = false; }
            if (reset) {
                this.reset();
            }
            var done, value;
            if (this.items == null) {
                this.items = this.parent.all();
            }
            done = this.items.length == 0;
            value = done ? null : this.items.pop();
            return new IteratorResult(value, done);
        };
        return ReverseIterator;
    })(ParentIterator);
    var SkipWhileIterator = (function (_super) {
        __extends(SkipWhileIterator, _super);
        function SkipWhileIterator(parent, func) {
            _super.call(this, parent);
            this.func = func;
            this.done = false;
        }
        SkipWhileIterator.prototype.reset = function () { _super.prototype.reset.call(this); this.done = false; };
        SkipWhileIterator.prototype.next = function (reset) {
            if (reset === void 0) { reset = false; }
            if (reset) {
                this.reset();
            }
            var item;
            while (!item || !this.done) {
                item = this.parent.next();
                this.done = this.done || item.done || !this.func(item.value);
            }
            return this.done ? item : new IteratorResult(null, true);
        };
        return SkipWhileIterator;
    })(ParentIterator);
    var SkipUntilIterator = (function (_super) {
        __extends(SkipUntilIterator, _super);
        function SkipUntilIterator(parent, func) {
            _super.call(this, parent, function (item) { return !func(item); });
        }
        return SkipUntilIterator;
    })(SkipWhileIterator);
    var TakeWhileIterator = (function (_super) {
        __extends(TakeWhileIterator, _super);
        function TakeWhileIterator(parent, func) {
            _super.call(this, parent);
            this.func = func;
            this.done = false;
        }
        TakeWhileIterator.prototype.reset = function () { _super.prototype.reset.call(this); this.done = false; };
        TakeWhileIterator.prototype.next = function (reset) {
            if (reset === void 0) { reset = false; }
            if (reset) {
                this.reset();
            }
            var item = this.done ? null : this.parent.next();
            this.done = item.done || !this.func(item.value);
            return this.done ? new IteratorResult(null, true) : item;
        };
        return TakeWhileIterator;
    })(ParentIterator);
    var TakeUntilIterator = (function (_super) {
        __extends(TakeUntilIterator, _super);
        function TakeUntilIterator(parent, func) {
            _super.call(this, parent, function (item) { return !func(item); });
        }
        return TakeUntilIterator;
    })(TakeWhileIterator);
    var UniqueByIterator = (function (_super) {
        __extends(UniqueByIterator, _super);
        function UniqueByIterator(parent, func) {
            _super.call(this, parent);
            this.func = func;
            this.items = [];
        }
        UniqueByIterator.prototype.reset = function () { _super.prototype.reset.call(this); this.items.length = 0; };
        UniqueByIterator.prototype.next = function (reset) {
            if (reset === void 0) { reset = false; }
            if (reset) {
                this.reset();
            }
            var item = this.parent.next(), key;
            while (!item.done) {
                key = this.func(item.value);
                if (this.items.indexOf(key) < 0) {
                    this.items.push(key);
                    break;
                }
                item = this.parent.next();
            }
            return item;
        };
        return UniqueByIterator;
    })(ParentIterator);
    var UniqueIterator = (function (_super) {
        __extends(UniqueIterator, _super);
        function UniqueIterator(parent) {
            _super.call(this, parent, function (item) { return item; });
        }
        return UniqueIterator;
    })(UniqueByIterator);
    var ZipIterator = (function (_super) {
        __extends(ZipIterator, _super);
        function ZipIterator() {
            _super.apply(this, arguments);
        }
        ZipIterator.prototype.next = function (reset) {
            if (reset === void 0) { reset = false; }
            if (reset) {
                this.reset();
            }
            var outer = this.parent.next(), inner = this.otherparent.next(), done = inner.done || outer.done, value = done ? null : new Zipping(outer.value, inner.value);
            return new IteratorResult(value, done);
        };
        return ZipIterator;
    })(CombineIterator);
})(Query || (Query = {}));
//# sourceMappingURL=query.js.map