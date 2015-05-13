/// <reference path="../query.ts/query.ts" />
/// <reference path="test.ts" />
/// <reference path="assert.ts" />

class QueryTests extends Test.Case {
    array: number[];

    before(): void {
        this.array = [2, 1, 4, 3, 6, 5];
    }

    @test
    As() {
        var result = Query.from(this.array).as(item => String(item));
        var expectation = ['2', '1', '4', '3', '6', '5'];
        Assert.that(result.count()).is.equal.to(expectation.length);
        Assert.that.all(result.as.array()).are.match.test((item, index) => item == expectation[index]);
    }

    @test
    AsArray() {
        var result = Query.from(this.array).as.array();
        var expectation = [2, 1, 4, 3, 6, 5];
        Assert.that(result.length).is.equal.to(expectation.length);
        Assert.that.all(result).are.match.test((item, index) => item == expectation[index]);
    }

    @test
    Count() {
        var result = Query.from(this.array).count();
        Assert.that(result).is.equal.to(6);
    }

    @test
    First() {
        var result = Query.from(this.array).first();
        Assert.that(result).is.equal.to(2);
    }

    @test
    Flatten() {
        var arrays: any[] = [{ items: [2, 1] }, { items: [4, 3] }, { items: [6, 5] }];
        var expectation = [2, 1, 4, 3, 6, 5];
        var result = Query.from(arrays).flatten(array => array.items);
        Assert.that(result.count()).is.equal.to(expectation.length);
        Assert.that.all(result.as.array()).are.match.test((item, index) => item == expectation[index]);
    }

    @test
    Group() {
        var result = Query.from(this.array).group.by(item => item % 2);
        Assert.that(result.count()).is.equal.to(2);
    }

    @test
    HasAll() {
        var result = Query.from(this.array);
        Assert.that(result.has.all(item => item > 0)).is.true();
        Assert.that(result.has.all(item => item > 2)).is.false();
    }

    @test
    HasAny() {
        var result = Query.from(this.array);
        Assert.that(result.has.any(item => item == 3)).is.true();
        Assert.that(result.has.any(item => item == 0)).is.false();
    }

    @test
    HasOnly() {
        this.array = [1, 1, 3, 2, 5, 4];
        var result = Query.from(this.array);
        Assert.that(result.has.only(item => item == 2)).is.true();
        Assert.that(result.has.only(item => item == 1)).is.false();
        Assert.that(result.has.only(item => item == 0)).is.false();
    }

    @test
    Last() {
        var result = Query.from(this.array).last();
        Assert.that(result).is.equal.to(5);
    }

    @test
    Maximum() {
        this.array = [2, 1, 4, 3, 4, 4];
        var result = Query.from(this.array).maximum();
        Assert.that(result.count()).is.equal.to(3);
        Assert.that.all(result.as.array()).are.equal.to(4);
    }

    @test
    MaximumBy() {
        var result = Query.from(this.array).maximum.by(item => item % 2);
        var expectation = [1, 3, 5];
        Assert.that(result.count()).is.equal.to(expectation.length);
        Assert.that.all(result.as.array()).are.match.test((item, index) => item == expectation[index]);
    }

    @test
    Minimum() {
        this.array = [1, 1, 3, 5, 2, 4];
        var result = Query.from(this.array).minimum();
        Assert.that(result.count()).is.equal.to(2);
        Assert.that.all(result.as.array()).are.equal.to(1);
    }

    @test
    MinimumBy() {
        var result = Query.from(this.array).minimum.by(item => item % 2);
        var expectation = [2, 4, 6];
        Assert.that(result.count()).is.equal.to(expectation.length);
        Assert.that.all(result.as.array()).are.match.test((item, index) => item == expectation[index]);
    }

    @test
    Mix() {
        var result = Query.from(this.array).mix.with(this.array);
        var expectation = [2, 1, 4, 3, 6, 5, 2, 1, 4, 3, 6, 5];
        Assert.that(result.count()).is.equal.to(expectation.length);
        Assert.that.all(result.as.array()).are.match.test((item, index) => item == expectation[index]);
    }

    @test
    Order() {
        var result = Query.from(this.array).order();
        var expectation = [1, 2, 3, 4, 5, 6];
        Assert.that(result.count()).is.equal.to(expectation.length);
        Assert.that.all(result.as.array()).are.match.test((item, index) => item == expectation[index]);
    }

    @test
    OrderBy() {
        var result = Query.from(this.array).order.by(item => item * -1);
        var expectation = [6, 5, 4, 3, 2, 1];
        Assert.that(result.count()).is.equal.to(expectation.length);
        Assert.that.all(result.as.array()).are.match.test((item, index) => item == expectation[index]);
    }

    @test
    Pair() {
        var items: number[] = [2, 1];
        var others: number[] = [1, 3];
        var result = Query.from(items).pair.with(others);
        var expectation = [{ source: 2, target: 1 }, { source: 2, target: 3 }, { source: 1, target: 1 }, { source: 1, target: 3 }]
        Assert.that(result.count()).is.equal.to(expectation.length);
        Assert.that.all(result.as.array())
            .are.match.test((item, index) => item.source == expectation[index].source && item.target == expectation[index].target);
    }

    @test
    PairIf() {
        var items: number[] = [2, 1];
        var others: number[] = [1, 3];
        var result = Query.from(items).pair.with(others).if(pair => pair.source != pair.target);
        var expectation = [{ source: 2, target: 1 }, { source: 2, target: 3 }, { source: 1, target: 3 }]
        Assert.that(result.count()).is.equal.to(expectation.length);
        Assert.that.all(result.as.array())
            .are.match.test((item, index) => item.source == expectation[index].source && item.target == expectation[index].target);
    

    }

    @test
    Reverse() {
        var result = Query.from(this.array).reverse();
        var expectation = [5, 6, 3, 4, 1, 2];
        Assert.that(result.count()).is.equal.to(expectation.length);
        Assert.that.all(result.as.array()).are.match.test((item, index) => item == expectation[index]);
    }

    @test
    Single() {
        var result = Query.from(this.array);
        Assert.that(result.take.if(item => item == 4).single()).is.equal.to(4);
        Assert.that(result.single()).is.null();
    }

    @test
    SkipCount() {
        var result = Query.from(this.array).skip(4);
        var expectation = [6, 5];
        Assert.that(result.count()).is.equal.to(expectation.length);
        Assert.that.all(result.as.array()).are.match.test((item, index) => item == expectation[index]);
    }

    @test
    SkipIf() {
        var result = Query.from(this.array).skip.if(item => item < 4);
        var expectation = [4, 6, 5];
        Assert.that(result.count()).is.equal.to(expectation.length);
        Assert.that.all(result.as.array()).are.match.test((item, index) => item == expectation[index]);
    }

    @test
    SkipWhile() {
        var result = Query.from(this.array).skip.while(item => item < 4);
        var expectation = [4, 3, 6, 5];
        Assert.that(result.count()).is.equal.to(expectation.length);
        Assert.that.all(result.as.array()).are.match.test((item, index) => item == expectation[index]);
    }

    @test
    SkipUntil() {
        var result = Query.from(this.array).skip.until(item => item > 4);
        var expectation = [6, 5];
        Assert.that(result.count()).is.equal.to(expectation.length);
        Assert.that.all(result.as.array()).are.match.test((item, index) => item == expectation[index]);
    }

    @test
    TakeCount() {
        var result = Query.from(this.array).take(4);
        var expectation = [2, 1, 4, 3];
        Assert.that(result.count()).is.equal.to(expectation.length);
        Assert.that.all(result.as.array()).are.match.test((item, index) => item == expectation[index]);
    }

    @test
    TakeIf() {
        var result = Query.from(this.array).take.if(item => item <= 4);
        var expectation = [2, 1, 4, 3];
        Assert.that(result.count()).is.equal.to(expectation.length);
        Assert.that.all(result.as.array()).are.match.test((item, index) => item == expectation[index]);
    }

    @test
    TakeWhile() {
        var result = Query.from(this.array).take.while(item => item < 4);
        var expectation = [2, 1];
        Assert.that(result.count()).is.equal.to(expectation.length);
        Assert.that.all(result.as.array()).are.match.test((item, index) => item == expectation[index]);
    }

    @test
    TakeUntil() {
        var result = Query.from(this.array).take.until(item => item > 4);
        var expectation = [2, 1, 4, 3];
        Assert.that(result.count()).is.equal.to(expectation.length);
        Assert.that.all(result.as.array()).are.match.test((item, index) => item == expectation[index]);
    }

    @test
    ThenBy() {
        var result = Query.from(this.array).order.by(item => item % 2).then.by(item => item);
        var expectation = [2, 4, 6, 1, 3, 5];
        Assert.that(result.count()).is.equal.to(expectation.length);
        Assert.that.all(result.as.array()).are.match.test((item, index) => item == expectation[index]);
    }

    @test
    Unique() {
        this.array = [2, 2, 4, 4, 6, 5];
        var expectation = [2, 4, 6, 5];
        var result = Query.from(this.array).unique();
        Assert.that(result.count()).is.equal.to(expectation.length);
        Assert.that.all(result.as.array()).are.match.test((item, index) => item == expectation[index]);
    }

    @test
    UniqueBy() {
        var result = Query.from(this.array).unique.by(item => item % 2);
        var expectation = [2, 1];
        Assert.that(result.count()).is.equal.to(expectation.length);
        Assert.that.all(result.as.array()).are.match.test((item, index) => item == expectation[index]);
    }

    @test
    Zip() {
        var items: number[] = [2, 1];
        var other: number[] = [4, 3];
        var result = Query.from(items).zip.with(other);
        var expectation = [{ source: 2, target: 4 }, { source: 1, target: 3 }];
        Assert.that(result.count()).is.equal.to(expectation.length);
        Assert.that.all(result.as.array())
            .are.match.test((item, index) => item.source == expectation[index].source && item.target == expectation[index].target);
    }
}

window.onload = () => {
    var testcase: Test.Case = new QueryTests();
    var element = document.getElementById('content');
    var pass = testcase.run();
    var results = testcase.results();
    var passed = results.filter(item=> item.state == Test.State.pass);
    var failed = results.filter(item=> item.state == Test.State.fail);
    var skipped = results.filter(item=> item.state == Test.State.skip);
    element.innerHTML = (passed ? passed.length + ' tests passed. ' : '')
    + (failed ? failed.length + ' tests failed. ' : '')
    + (skipped ? skipped.length + ' tests skipped. ' : '');
};