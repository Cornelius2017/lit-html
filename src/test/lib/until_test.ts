/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

/// <reference path="../../../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../../../node_modules/@types/chai/index.d.ts" />

import {until} from '../../lib/until.js';
import {html, render} from '../../lit-html.js';

const assert = chai.assert;

suite('until', () => {

  let container: HTMLDivElement;
  let deferred: Deferred<string>;

  setup(() => {
    container = document.createElement('div');
    deferred = new Deferred<string>();
  });

  test('displays defaultContent immediately', async () => {
    render(
        html
        `<div>${until(deferred.promise, html`<span>loading...</span>`)}</div>`,
        container);
    assert.equal(container.innerHTML, '<div><span>loading...</span></div>');

    deferred.resolve('foo');
    await deferred.promise;
    assert.equal(container.innerHTML, '<div>foo</div>');
  });

  test('renders new Promise over existing Promise', async () => {
    const t = (v: any) =>
        html`<div>${until(v, html`<span>loading...</span>`)}</div>`;
    render(t(deferred.promise), container);
    assert.equal(container.innerHTML, '<div><span>loading...</span></div>');

    const deferred2 = new Deferred<string>();
    render(t(deferred2.promise), container);
    assert.equal(container.innerHTML, '<div><span>loading...</span></div>');

    deferred2.resolve('bar');
    await deferred2.promise;
    assert.equal(container.innerHTML, '<div>bar</div>');

    deferred.resolve('foo');
    await deferred.promise;
    assert.equal(container.innerHTML, '<div>bar</div>');
  });

});

class Deferred<T> {
  readonly promise: Promise<T>;
  readonly resolve: (value: T) => void;
  readonly reject: (error: Error) => void;

  constructor() {
    this.promise = new Promise<T>((res, rej) => {
      this.resolve! = res;
      this.reject! = rej;
    });
  }
}
