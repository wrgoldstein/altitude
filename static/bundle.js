
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
function noop() { }
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function add_location(element, file, line, column, char) {
    element.__svelte_meta = {
        loc: { file, line, column, char }
    };
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if (typeof $$scope.dirty === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error(`Function called outside component initialization`);
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
const seen_callbacks = new Set();
function flush() {
    do {
        // first, call beforeUpdate functions
        // and update components
        while (dirty_components.length) {
            const component = dirty_components.shift();
            set_current_component(component);
            update(component.$$);
        }
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
            on_destroy.push(...new_on_destroy);
        }
        else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const prop_values = options.props || {};
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if ($$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(children(options.target));
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set() {
        // overridden by instance, if it has props
    }
}

function dispatch_dev(type, detail) {
    document.dispatchEvent(custom_event(type, Object.assign({ version: '3.18.1' }, detail)));
}
function append_dev(target, node) {
    dispatch_dev("SvelteDOMInsert", { target, node });
    append(target, node);
}
function insert_dev(target, node, anchor) {
    dispatch_dev("SvelteDOMInsert", { target, node, anchor });
    insert(target, node, anchor);
}
function detach_dev(node) {
    dispatch_dev("SvelteDOMRemove", { node });
    detach(node);
}
function attr_dev(node, attribute, value) {
    attr(node, attribute, value);
    if (value == null)
        dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
    else
        dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
}
function set_data_dev(text, data) {
    data = '' + data;
    if (text.data === data)
        return;
    dispatch_dev("SvelteDOMSetData", { node: text, data });
    text.data = data;
}
class SvelteComponentDev extends SvelteComponent {
    constructor(options) {
        if (!options || (!options.target && !options.$$inline)) {
            throw new Error(`'target' is a required option`);
        }
        super();
    }
    $destroy() {
        super.$destroy();
        this.$destroy = () => {
            console.warn(`Component was already destroyed`); // eslint-disable-line no-console
        };
    }
}

/* src/Navbar.svelte generated by Svelte v3.18.1 */

const file = "src/Navbar.svelte";

function create_fragment(ctx) {
	let nav;
	let div0;
	let p;
	let t1;
	let a0;
	let span0;
	let t2;
	let span1;
	let t3;
	let span2;
	let t4;
	let div7;
	let div3;
	let a1;
	let t6;
	let a2;
	let t8;
	let a3;
	let t10;
	let div2;
	let a4;
	let t12;
	let div1;
	let a5;
	let t14;
	let a6;
	let t16;
	let a7;
	let t18;
	let hr;
	let t19;
	let a8;
	let t21;
	let div6;
	let div5;
	let div4;
	let a9;
	let strong;
	let t23;
	let a10;

	const block = {
		c: function create() {
			nav = element("nav");
			div0 = element("div");
			p = element("p");
			p.textContent = "logo corp";
			t1 = space();
			a0 = element("a");
			span0 = element("span");
			t2 = space();
			span1 = element("span");
			t3 = space();
			span2 = element("span");
			t4 = space();
			div7 = element("div");
			div3 = element("div");
			a1 = element("a");
			a1.textContent = "Home";
			t6 = space();
			a2 = element("a");
			a2.textContent = "Search";
			t8 = space();
			a3 = element("a");
			a3.textContent = "Discover";
			t10 = space();
			div2 = element("div");
			a4 = element("a");
			a4.textContent = "More";
			t12 = space();
			div1 = element("div");
			a5 = element("a");
			a5.textContent = "About";
			t14 = space();
			a6 = element("a");
			a6.textContent = "Jobs";
			t16 = space();
			a7 = element("a");
			a7.textContent = "Contact";
			t18 = space();
			hr = element("hr");
			t19 = space();
			a8 = element("a");
			a8.textContent = "Report an issue";
			t21 = space();
			div6 = element("div");
			div5 = element("div");
			div4 = element("div");
			a9 = element("a");
			strong = element("strong");
			strong.textContent = "Sign up";
			t23 = space();
			a10 = element("a");
			a10.textContent = "Log in";
			attr_dev(p, "class", "navbar-item logo svelte-1nfq898");
			add_location(p, file, 3, 6, 104);
			attr_dev(span0, "aria-hidden", "true");
			add_location(span0, file, 7, 6, 278);
			attr_dev(span1, "aria-hidden", "true");
			add_location(span1, file, 8, 6, 317);
			attr_dev(span2, "aria-hidden", "true");
			add_location(span2, file, 9, 6, 356);
			attr_dev(a0, "role", "button");
			attr_dev(a0, "class", "navbar-burger burger");
			attr_dev(a0, "aria-label", "menu");
			attr_dev(a0, "aria-expanded", "false");
			attr_dev(a0, "data-target", "navbarBasicExample");
			add_location(a0, file, 6, 4, 152);
			attr_dev(div0, "class", "navbar-brand");
			add_location(div0, file, 2, 2, 71);
			attr_dev(a1, "class", "navbar-item");
			add_location(a1, file, 15, 6, 497);
			attr_dev(a2, "class", "navbar-item");
			add_location(a2, file, 19, 6, 552);
			attr_dev(a3, "class", "navbar-item");
			add_location(a3, file, 23, 6, 609);
			attr_dev(a4, "class", "navbar-link");
			add_location(a4, file, 28, 8, 728);
			attr_dev(a5, "class", "navbar-item");
			add_location(a5, file, 33, 10, 829);
			attr_dev(a6, "class", "navbar-item");
			add_location(a6, file, 36, 10, 896);
			attr_dev(a7, "class", "navbar-item");
			add_location(a7, file, 39, 10, 962);
			attr_dev(hr, "class", "navbar-divider");
			add_location(hr, file, 42, 10, 1031);
			attr_dev(a8, "class", "navbar-item");
			add_location(a8, file, 43, 10, 1069);
			attr_dev(div1, "class", "navbar-dropdown");
			add_location(div1, file, 32, 8, 789);
			attr_dev(div2, "class", "navbar-item has-dropdown is-hoverable");
			add_location(div2, file, 27, 6, 668);
			attr_dev(div3, "class", "navbar-start");
			add_location(div3, file, 14, 4, 464);
			add_location(strong, file, 54, 12, 1319);
			attr_dev(a9, "class", "button is-primary");
			add_location(a9, file, 53, 10, 1277);
			attr_dev(a10, "class", "button is-light");
			add_location(a10, file, 56, 10, 1369);
			attr_dev(div4, "class", "buttons");
			add_location(div4, file, 52, 8, 1245);
			attr_dev(div5, "class", "navbar-item");
			add_location(div5, file, 51, 6, 1211);
			attr_dev(div6, "class", "navbar-end");
			add_location(div6, file, 50, 4, 1180);
			attr_dev(div7, "id", "navbarBasicExample");
			attr_dev(div7, "class", "navbar-menu");
			add_location(div7, file, 13, 2, 410);
			attr_dev(nav, "class", "navbar");
			attr_dev(nav, "role", "navigation");
			attr_dev(nav, "aria-label", "main navigation");
			add_location(nav, file, 1, 0, 1);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, nav, anchor);
			append_dev(nav, div0);
			append_dev(div0, p);
			append_dev(div0, t1);
			append_dev(div0, a0);
			append_dev(a0, span0);
			append_dev(a0, t2);
			append_dev(a0, span1);
			append_dev(a0, t3);
			append_dev(a0, span2);
			append_dev(nav, t4);
			append_dev(nav, div7);
			append_dev(div7, div3);
			append_dev(div3, a1);
			append_dev(div3, t6);
			append_dev(div3, a2);
			append_dev(div3, t8);
			append_dev(div3, a3);
			append_dev(div3, t10);
			append_dev(div3, div2);
			append_dev(div2, a4);
			append_dev(div2, t12);
			append_dev(div2, div1);
			append_dev(div1, a5);
			append_dev(div1, t14);
			append_dev(div1, a6);
			append_dev(div1, t16);
			append_dev(div1, a7);
			append_dev(div1, t18);
			append_dev(div1, hr);
			append_dev(div1, t19);
			append_dev(div1, a8);
			append_dev(div7, t21);
			append_dev(div7, div6);
			append_dev(div6, div5);
			append_dev(div5, div4);
			append_dev(div4, a9);
			append_dev(a9, strong);
			append_dev(div4, t23);
			append_dev(div4, a10);
		},
		p: noop,
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(nav);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

class Navbar extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, null, create_fragment, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Navbar",
			options,
			id: create_fragment.name
		});
	}
}

/* src/Layout.svelte generated by Svelte v3.18.1 */

function create_fragment$1(ctx) {
	let t0;
	let t1;
	let current;
	const navbar = new Navbar({ $$inline: true });
	const default_slot_template = /*$$slots*/ ctx[1].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

	const block = {
		c: function create() {
			create_component(navbar.$$.fragment);
			t0 = space();

			if (!default_slot) {
				t1 = text("Stuff goes here");
			}

			if (default_slot) default_slot.c();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			mount_component(navbar, target, anchor);
			insert_dev(target, t0, anchor);

			if (!default_slot) {
				insert_dev(target, t1, anchor);
			}

			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (default_slot && default_slot.p && dirty & /*$$scope*/ 1) {
				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[0], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null));
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(navbar.$$.fragment, local);
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(navbar.$$.fragment, local);
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(navbar, detaching);
			if (detaching) detach_dev(t0);

			if (!default_slot) {
				if (detaching) detach_dev(t1);
			}

			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$1.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance($$self, $$props, $$invalidate) {
	let { $$slots = {}, $$scope } = $$props;

	$$self.$set = $$props => {
		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => {
		return {};
	};

	$$self.$inject_state = $$props => {
		
	};

	return [$$scope, $$slots];
}

class Layout extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment$1, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Layout",
			options,
			id: create_fragment$1.name
		});
	}
}

/* src/Table.svelte generated by Svelte v3.18.1 */
const file$1 = "src/Table.svelte";

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[3] = list[i];
	return child_ctx;
}

// (35:3) {#each table.columns || [] as column}
function create_each_block(ctx) {
	let tr;
	let td0;
	let t0_value = /*column*/ ctx[3].name + "";
	let t0;
	let t1;
	let td1;
	let t2_value = /*column*/ ctx[3].column_type + "";
	let t2;
	let t3;
	let td2;

	let t4_value = (/*column*/ ctx[3].description
	? /*column*/ ctx[3].description
	: "--") + "";

	let t4;
	let t5;
	let td3;
	let t6_value = /*column*/ ctx[3].tags + "";
	let t6;
	let t7;

	const block = {
		c: function create() {
			tr = element("tr");
			td0 = element("td");
			t0 = text(t0_value);
			t1 = space();
			td1 = element("td");
			t2 = text(t2_value);
			t3 = space();
			td2 = element("td");
			t4 = text(t4_value);
			t5 = space();
			td3 = element("td");
			t6 = text(t6_value);
			t7 = space();
			add_location(td0, file$1, 36, 5, 784);
			add_location(td1, file$1, 37, 5, 812);
			add_location(td2, file$1, 38, 5, 847);
			add_location(td3, file$1, 39, 5, 910);
			add_location(tr, file$1, 35, 4, 774);
		},
		m: function mount(target, anchor) {
			insert_dev(target, tr, anchor);
			append_dev(tr, td0);
			append_dev(td0, t0);
			append_dev(tr, t1);
			append_dev(tr, td1);
			append_dev(td1, t2);
			append_dev(tr, t3);
			append_dev(tr, td2);
			append_dev(td2, t4);
			append_dev(tr, t5);
			append_dev(tr, td3);
			append_dev(td3, t6);
			append_dev(tr, t7);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*table*/ 1 && t0_value !== (t0_value = /*column*/ ctx[3].name + "")) set_data_dev(t0, t0_value);
			if (dirty & /*table*/ 1 && t2_value !== (t2_value = /*column*/ ctx[3].column_type + "")) set_data_dev(t2, t2_value);

			if (dirty & /*table*/ 1 && t4_value !== (t4_value = (/*column*/ ctx[3].description
			? /*column*/ ctx[3].description
			: "--") + "")) set_data_dev(t4, t4_value);

			if (dirty & /*table*/ 1 && t6_value !== (t6_value = /*column*/ ctx[3].tags + "")) set_data_dev(t6, t6_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(tr);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block.name,
		type: "each",
		source: "(35:3) {#each table.columns || [] as column}",
		ctx
	});

	return block;
}

function create_fragment$2(ctx) {
	let title_value;
	let t0;
	let div3;
	let p0;
	let t1_value = /*table*/ ctx[0].schema + "";
	let t1;
	let t2;
	let t3_value = /*table*/ ctx[0].name + "";
	let t3;
	let t4;
	let p1;
	let t5_value = /*table*/ ctx[0].description + "";
	let t5;
	let t6;
	let div0;
	let t7;
	let div1;
	let table_1;
	let tr;
	let th0;
	let t9;
	let th1;
	let t11;
	let th2;
	let t13;
	let th3;
	let t15;
	let t16;
	let div2;
	document.title = title_value = "Altitude: " + /*table*/ ctx[0].name;
	let each_value = /*table*/ ctx[0].columns || [];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const block = {
		c: function create() {
			t0 = space();
			div3 = element("div");
			p0 = element("p");
			t1 = text(t1_value);
			t2 = text(".");
			t3 = text(t3_value);
			t4 = space();
			p1 = element("p");
			t5 = text(t5_value);
			t6 = space();
			div0 = element("div");
			t7 = space();
			div1 = element("div");
			table_1 = element("table");
			tr = element("tr");
			th0 = element("th");
			th0.textContent = "column name";
			t9 = space();
			th1 = element("th");
			th1.textContent = "column type";
			t11 = space();
			th2 = element("th");
			th2.textContent = "description";
			t13 = space();
			th3 = element("th");
			th3.textContent = "tags";
			t15 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t16 = space();
			div2 = element("div");
			attr_dev(p0, "class", "panel-heading");
			add_location(p0, file$1, 22, 1, 457);
			attr_dev(p1, "class", "panel-block description svelte-7yxo5c");
			add_location(p1, file$1, 23, 1, 515);
			attr_dev(div0, "class", "level");
			add_location(div0, file$1, 25, 1, 576);
			attr_dev(th0, "class", "svelte-7yxo5c");
			add_location(th0, file$1, 29, 4, 631);
			attr_dev(th1, "class", "svelte-7yxo5c");
			add_location(th1, file$1, 30, 4, 656);
			attr_dev(th2, "class", "svelte-7yxo5c");
			add_location(th2, file$1, 31, 4, 681);
			attr_dev(th3, "class", "svelte-7yxo5c");
			add_location(th3, file$1, 32, 4, 706);
			add_location(tr, file$1, 28, 3, 622);
			attr_dev(table_1, "class", "svelte-7yxo5c");
			add_location(table_1, file$1, 27, 2, 611);
			add_location(div1, file$1, 26, 1, 603);
			attr_dev(div2, "class", "level");
			add_location(div2, file$1, 44, 1, 974);
			attr_dev(div3, "class", "panel is-primary");
			add_location(div3, file$1, 21, 0, 425);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t0, anchor);
			insert_dev(target, div3, anchor);
			append_dev(div3, p0);
			append_dev(p0, t1);
			append_dev(p0, t2);
			append_dev(p0, t3);
			append_dev(div3, t4);
			append_dev(div3, p1);
			append_dev(p1, t5);
			append_dev(div3, t6);
			append_dev(div3, div0);
			append_dev(div3, t7);
			append_dev(div3, div1);
			append_dev(div1, table_1);
			append_dev(table_1, tr);
			append_dev(tr, th0);
			append_dev(tr, t9);
			append_dev(tr, th1);
			append_dev(tr, t11);
			append_dev(tr, th2);
			append_dev(tr, t13);
			append_dev(tr, th3);
			append_dev(table_1, t15);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(table_1, null);
			}

			append_dev(div3, t16);
			append_dev(div3, div2);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*table*/ 1 && title_value !== (title_value = "Altitude: " + /*table*/ ctx[0].name)) {
				document.title = title_value;
			}

			if (dirty & /*table*/ 1 && t1_value !== (t1_value = /*table*/ ctx[0].schema + "")) set_data_dev(t1, t1_value);
			if (dirty & /*table*/ 1 && t3_value !== (t3_value = /*table*/ ctx[0].name + "")) set_data_dev(t3, t3_value);
			if (dirty & /*table*/ 1 && t5_value !== (t5_value = /*table*/ ctx[0].description + "")) set_data_dev(t5, t5_value);

			if (dirty & /*table*/ 1) {
				each_value = /*table*/ ctx[0].columns || [];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(table_1, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(t0);
			if (detaching) detach_dev(div3);
			destroy_each(each_blocks, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$2.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$1($$self, $$props, $$invalidate) {
	let { table_name } = $$props;
	let table = {};

	const get_table_metadata = async table_name => {
		const response = await fetch(`/tables/${table_name}.json`).then(resp => resp.json());
		$$invalidate(0, table = response);
	};

	onMount(() => {
		get_table_metadata(table_name);
	});

	const writable_props = ["table_name"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Table> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("table_name" in $$props) $$invalidate(1, table_name = $$props.table_name);
	};

	$$self.$capture_state = () => {
		return { table_name, table };
	};

	$$self.$inject_state = $$props => {
		if ("table_name" in $$props) $$invalidate(1, table_name = $$props.table_name);
		if ("table" in $$props) $$invalidate(0, table = $$props.table);
	};

	return [table, table_name];
}

class Table extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$1, create_fragment$2, safe_not_equal, { table_name: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Table",
			options,
			id: create_fragment$2.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*table_name*/ ctx[1] === undefined && !("table_name" in props)) {
			console.warn("<Table> was created without expected prop 'table_name'");
		}
	}

	get table_name() {
		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set table_name(value) {
		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/App.svelte generated by Svelte v3.18.1 */
const file$2 = "src/App.svelte";

// (12:1) {:else}
function create_else_block(ctx) {
	let h1;
	let t0;
	let t1;
	let t2;

	const block = {
		c: function create() {
			h1 = element("h1");
			t0 = text("Hello ");
			t1 = text(/*table*/ ctx[0]);
			t2 = text("!");
			attr_dev(h1, "class", "svelte-1t2rlhk");
			add_location(h1, file$2, 12, 2, 186);
		},
		m: function mount(target, anchor) {
			insert_dev(target, h1, anchor);
			append_dev(h1, t0);
			append_dev(h1, t1);
			append_dev(h1, t2);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*table*/ 1) set_data_dev(t1, /*table*/ ctx[0]);
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(h1);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block.name,
		type: "else",
		source: "(12:1) {:else}",
		ctx
	});

	return block;
}

// (10:1) {#if table}
function create_if_block(ctx) {
	let current;

	const table_1 = new Table({
			props: { table_name: /*table*/ ctx[0] },
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(table_1.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(table_1, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const table_1_changes = {};
			if (dirty & /*table*/ 1) table_1_changes.table_name = /*table*/ ctx[0];
			table_1.$set(table_1_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(table_1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(table_1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(table_1, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(10:1) {#if table}",
		ctx
	});

	return block;
}

// (8:0) <Layout>
function create_default_slot(ctx) {
	let main;
	let current_block_type_index;
	let if_block;
	let current;
	const if_block_creators = [create_if_block, create_else_block];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*table*/ ctx[0]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	const block = {
		c: function create() {
			main = element("main");
			if_block.c();
			attr_dev(main, "class", "svelte-1t2rlhk");
			add_location(main, file$2, 8, 1, 124);
		},
		m: function mount(target, anchor) {
			insert_dev(target, main, anchor);
			if_blocks[current_block_type_index].m(main, null);
			current = true;
		},
		p: function update(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(main, null);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(main);
			if_blocks[current_block_type_index].d();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot.name,
		type: "slot",
		source: "(8:0) <Layout>",
		ctx
	});

	return block;
}

function create_fragment$3(ctx) {
	let current;

	const layout = new Layout({
			props: {
				$$slots: { default: [create_default_slot] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(layout.$$.fragment);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			mount_component(layout, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const layout_changes = {};

			if (dirty & /*$$scope, table*/ 3) {
				layout_changes.$$scope = { dirty, ctx };
			}

			layout.$set(layout_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(layout.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(layout.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(layout, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$3.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$2($$self, $$props, $$invalidate) {
	let { table } = $$props;
	const writable_props = ["table"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("table" in $$props) $$invalidate(0, table = $$props.table);
	};

	$$self.$capture_state = () => {
		return { table };
	};

	$$self.$inject_state = $$props => {
		if ("table" in $$props) $$invalidate(0, table = $$props.table);
	};

	return [table];
}

class App extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$2, create_fragment$3, safe_not_equal, { table: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "App",
			options,
			id: create_fragment$3.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*table*/ ctx[0] === undefined && !("table" in props)) {
			console.warn("<App> was created without expected prop 'table'");
		}
	}

	get table() {
		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set table(value) {
		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

export { App };
//# sourceMappingURL=bundle.js.map
