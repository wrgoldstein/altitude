
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
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function set_custom_element_data(node, prop, value) {
    if (prop in node) {
        node[prop] = value;
    }
    else {
        attr(node, prop, value);
    }
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_input_value(input, value) {
    if (value != null || input.value) {
        input.value = value;
    }
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

const globals = (typeof window !== 'undefined' ? window : global);
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
function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
    const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
    if (has_prevent_default)
        modifiers.push('preventDefault');
    if (has_stop_propagation)
        modifiers.push('stopPropagation');
    dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
    const dispose = listen(node, event, handler, options);
    return () => {
        dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
        dispose();
    };
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
	let div5;
	let div1;
	let a1;
	let t6;
	let a2;
	let t8;
	let a3;
	let t10;
	let a4;
	let t12;
	let div4;
	let div3;
	let div2;
	let a5;
	let strong;
	let t14;
	let a6;

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
			div5 = element("div");
			div1 = element("div");
			a1 = element("a");
			a1.textContent = "Home";
			t6 = space();
			a2 = element("a");
			a2.textContent = "Tables";
			t8 = space();
			a3 = element("a");
			a3.textContent = "Queries";
			t10 = space();
			a4 = element("a");
			a4.textContent = "Settings";
			t12 = space();
			div4 = element("div");
			div3 = element("div");
			div2 = element("div");
			a5 = element("a");
			strong = element("strong");
			strong.textContent = "Sign up";
			t14 = space();
			a6 = element("a");
			a6.textContent = "Log in";
			attr_dev(p, "class", "navbar-item logo svelte-1dzdl6f");
			add_location(p, file, 3, 6, 104);
			attr_dev(span0, "aria-hidden", "true");
			add_location(span0, file, 7, 6, 287);
			attr_dev(span1, "aria-hidden", "true");
			add_location(span1, file, 8, 6, 326);
			attr_dev(span2, "aria-hidden", "true");
			add_location(span2, file, 9, 6, 365);
			attr_dev(a0, "href", "#");
			attr_dev(a0, "role", "button");
			attr_dev(a0, "class", "navbar-burger burger svelte-1dzdl6f");
			attr_dev(a0, "aria-label", "menu");
			attr_dev(a0, "aria-expanded", "false");
			attr_dev(a0, "data-target", "navbarBasicExample");
			add_location(a0, file, 6, 4, 152);
			attr_dev(div0, "class", "navbar-brand");
			add_location(div0, file, 2, 2, 71);
			attr_dev(a1, "href", "/");
			attr_dev(a1, "class", "navbar-item svelte-1dzdl6f");
			add_location(a1, file, 15, 6, 506);
			attr_dev(a2, "href", "/tables");
			attr_dev(a2, "class", "navbar-item svelte-1dzdl6f");
			add_location(a2, file, 19, 6, 570);
			attr_dev(a3, "href", "");
			attr_dev(a3, "class", "navbar-item svelte-1dzdl6f");
			add_location(a3, file, 23, 6, 642);
			attr_dev(a4, "href", "");
			attr_dev(a4, "class", "navbar-item svelte-1dzdl6f");
			add_location(a4, file, 27, 6, 708);
			attr_dev(div1, "class", "navbar-start");
			add_location(div1, file, 14, 4, 473);
			add_location(strong, file, 36, 12, 931);
			attr_dev(a5, "href", "");
			attr_dev(a5, "class", "button is-primary svelte-1dzdl6f");
			add_location(a5, file, 35, 10, 881);
			attr_dev(a6, "href", "");
			attr_dev(a6, "class", "button is-light svelte-1dzdl6f");
			add_location(a6, file, 38, 10, 981);
			attr_dev(div2, "class", "buttons");
			add_location(div2, file, 34, 8, 849);
			attr_dev(div3, "class", "navbar-item");
			add_location(div3, file, 33, 6, 815);
			attr_dev(div4, "class", "navbar-end");
			add_location(div4, file, 32, 4, 784);
			attr_dev(div5, "id", "navbarBasicExample");
			attr_dev(div5, "class", "navbar-menu");
			add_location(div5, file, 13, 2, 419);
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
			append_dev(nav, div5);
			append_dev(div5, div1);
			append_dev(div1, a1);
			append_dev(div1, t6);
			append_dev(div1, a2);
			append_dev(div1, t8);
			append_dev(div1, a3);
			append_dev(div1, t10);
			append_dev(div1, a4);
			append_dev(div5, t12);
			append_dev(div5, div4);
			append_dev(div4, div3);
			append_dev(div3, div2);
			append_dev(div2, a5);
			append_dev(a5, strong);
			append_dev(div2, t14);
			append_dev(div2, a6);
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

/* src/components/ColumnModal.svelte generated by Svelte v3.18.1 */

const { console: console_1 } = globals;
const file$1 = "src/components/ColumnModal.svelte";

function create_fragment$2(ctx) {
	let div2;
	let div0;
	let t0;
	let div1;
	let header;
	let p;
	let t1_value = /*table*/ ctx[1].tablename + "";
	let t1;
	let t2;
	let t3_value = /*column*/ ctx[0].column_name + "";
	let t3;
	let t4;
	let button0;
	let t5;
	let section;
	let t6;
	let footer;
	let button1;
	let t8;
	let button2;
	let current;
	let dispose;
	const default_slot_template = /*$$slots*/ ctx[7].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

	const block = {
		c: function create() {
			div2 = element("div");
			div0 = element("div");
			t0 = space();
			div1 = element("div");
			header = element("header");
			p = element("p");
			t1 = text(t1_value);
			t2 = text(".");
			t3 = text(t3_value);
			t4 = space();
			button0 = element("button");
			t5 = space();
			section = element("section");
			if (default_slot) default_slot.c();
			t6 = space();
			footer = element("footer");
			button1 = element("button");
			button1.textContent = "Save changes";
			t8 = space();
			button2 = element("button");
			button2.textContent = "Cancel";
			attr_dev(div0, "class", "modal-background");
			add_location(div0, file$1, 22, 2, 444);
			attr_dev(p, "class", "modal-card-title");
			add_location(p, file$1, 25, 6, 551);
			attr_dev(button0, "class", "delete");
			attr_dev(button0, "aria-label", "close");
			add_location(button0, file$1, 26, 6, 628);
			attr_dev(header, "class", "modal-card-head");
			add_location(header, file$1, 24, 4, 512);
			attr_dev(section, "class", "modal-card-body");
			add_location(section, file$1, 28, 4, 715);
			attr_dev(button1, "class", "button is-success");
			add_location(button1, file$1, 32, 6, 827);
			attr_dev(button2, "class", "button");
			add_location(button2, file$1, 33, 6, 905);
			attr_dev(footer, "class", "modal-card-foot");
			add_location(footer, file$1, 31, 4, 788);
			attr_dev(div1, "class", "modal-card");
			add_location(div1, file$1, 23, 2, 483);
			attr_dev(div2, "class", "modal is-active");
			add_location(div2, file$1, 21, 0, 412);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div2, anchor);
			append_dev(div2, div0);
			append_dev(div2, t0);
			append_dev(div2, div1);
			append_dev(div1, header);
			append_dev(header, p);
			append_dev(p, t1);
			append_dev(p, t2);
			append_dev(p, t3);
			append_dev(header, t4);
			append_dev(header, button0);
			append_dev(div1, t5);
			append_dev(div1, section);

			if (default_slot) {
				default_slot.m(section, null);
			}

			append_dev(div1, t6);
			append_dev(div1, footer);
			append_dev(footer, button1);
			append_dev(footer, t8);
			append_dev(footer, button2);
			current = true;

			dispose = [
				listen_dev(button0, "click", /*close*/ ctx[3], false, false, false),
				listen_dev(button1, "click", /*save*/ ctx[2], false, false, false),
				listen_dev(button2, "click", /*close*/ ctx[3], false, false, false)
			];
		},
		p: function update(ctx, [dirty]) {
			if ((!current || dirty & /*table*/ 2) && t1_value !== (t1_value = /*table*/ ctx[1].tablename + "")) set_data_dev(t1, t1_value);
			if ((!current || dirty & /*column*/ 1) && t3_value !== (t3_value = /*column*/ ctx[0].column_name + "")) set_data_dev(t3, t3_value);

			if (default_slot && default_slot.p && dirty & /*$$scope*/ 64) {
				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[6], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null));
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div2);
			if (default_slot) default_slot.d(detaching);
			run_all(dispose);
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
	let { table } = $$props,
		{ column } = $$props,
		{ save } = $$props,
		{ close } = $$props;

	let saved = false;
	onMount(() => console.log(column));

	document.addEventListener("keydown", event => {
		if (event.keyCode == 27) {
			$$invalidate(0, column = undefined);
		}
	});

	const this_save = () => {
		save();
		saved = true;
		setTimeout(() => saved = false, 300);
	};

	const writable_props = ["table", "column", "save", "close"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<ColumnModal> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;

	$$self.$set = $$props => {
		if ("table" in $$props) $$invalidate(1, table = $$props.table);
		if ("column" in $$props) $$invalidate(0, column = $$props.column);
		if ("save" in $$props) $$invalidate(2, save = $$props.save);
		if ("close" in $$props) $$invalidate(3, close = $$props.close);
		if ("$$scope" in $$props) $$invalidate(6, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => {
		return { table, column, save, close, saved };
	};

	$$self.$inject_state = $$props => {
		if ("table" in $$props) $$invalidate(1, table = $$props.table);
		if ("column" in $$props) $$invalidate(0, column = $$props.column);
		if ("save" in $$props) $$invalidate(2, save = $$props.save);
		if ("close" in $$props) $$invalidate(3, close = $$props.close);
		if ("saved" in $$props) saved = $$props.saved;
	};

	return [column, table, save, close, saved, this_save, $$scope, $$slots];
}

class ColumnModal extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$1, create_fragment$2, safe_not_equal, { table: 1, column: 0, save: 2, close: 3 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "ColumnModal",
			options,
			id: create_fragment$2.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*table*/ ctx[1] === undefined && !("table" in props)) {
			console_1.warn("<ColumnModal> was created without expected prop 'table'");
		}

		if (/*column*/ ctx[0] === undefined && !("column" in props)) {
			console_1.warn("<ColumnModal> was created without expected prop 'column'");
		}

		if (/*save*/ ctx[2] === undefined && !("save" in props)) {
			console_1.warn("<ColumnModal> was created without expected prop 'save'");
		}

		if (/*close*/ ctx[3] === undefined && !("close" in props)) {
			console_1.warn("<ColumnModal> was created without expected prop 'close'");
		}
	}

	get table() {
		throw new Error("<ColumnModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set table(value) {
		throw new Error("<ColumnModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get column() {
		throw new Error("<ColumnModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set column(value) {
		throw new Error("<ColumnModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get save() {
		throw new Error("<ColumnModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set save(value) {
		throw new Error("<ColumnModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get close() {
		throw new Error("<ColumnModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set close(value) {
		throw new Error("<ColumnModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/Table.svelte generated by Svelte v3.18.1 */
const file$2 = "src/Table.svelte";

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[8] = list[i];
	child_ctx[10] = i;
	return child_ctx;
}

// (53:0) {#if modal_column}
function create_if_block(ctx) {
	let current;

	const columnmodal = new ColumnModal({
			props: {
				table: /*table*/ ctx[0],
				column: /*modal_column*/ ctx[1],
				save: /*save*/ ctx[3],
				close: /*close*/ ctx[4],
				$$slots: { default: [create_default_slot] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(columnmodal.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(columnmodal, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const columnmodal_changes = {};
			if (dirty & /*table*/ 1) columnmodal_changes.table = /*table*/ ctx[0];
			if (dirty & /*modal_column*/ 2) columnmodal_changes.column = /*modal_column*/ ctx[1];

			if (dirty & /*$$scope, modal_column*/ 2050) {
				columnmodal_changes.$$scope = { dirty, ctx };
			}

			columnmodal.$set(columnmodal_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(columnmodal.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(columnmodal.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(columnmodal, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(53:0) {#if modal_column}",
		ctx
	});

	return block;
}

// (54:1) <ColumnModal table={table} column={modal_column} {save} {close}>
function create_default_slot(ctx) {
	let div4;
	let div1;
	let div0;
	let p0;
	let t1;
	let textarea;
	let t2;
	let div3;
	let div2;
	let p1;
	let t4;
	let p2;
	let t5_value = /*modal_column*/ ctx[1].tags + "";
	let t5;
	let dispose;

	const block = {
		c: function create() {
			div4 = element("div");
			div1 = element("div");
			div0 = element("div");
			p0 = element("p");
			p0.textContent = "description";
			t1 = space();
			textarea = element("textarea");
			t2 = space();
			div3 = element("div");
			div2 = element("div");
			p1 = element("p");
			p1.textContent = "tags";
			t4 = space();
			p2 = element("p");
			t5 = text(t5_value);
			attr_dev(p0, "class", "heading");
			add_location(p0, file$2, 57, 5, 1307);
			attr_dev(textarea, "class", "textarea svelte-abtnyv");
			attr_dev(textarea, "placeholder", "e.g. Favorite column ever!");
			add_location(textarea, file$2, 58, 5, 1347);
			attr_dev(div0, "class", "level-item has-text-centered column");
			add_location(div0, file$2, 56, 4, 1252);
			attr_dev(div1, "class", "column");
			add_location(div1, file$2, 55, 3, 1227);
			attr_dev(p1, "class", "heading");
			add_location(p1, file$2, 63, 5, 1569);
			attr_dev(p2, "class", "");
			add_location(p2, file$2, 64, 5, 1602);
			attr_dev(div2, "class", "level-item has-text-centered column");
			add_location(div2, file$2, 62, 4, 1514);
			attr_dev(div3, "class", "column");
			add_location(div3, file$2, 61, 3, 1489);
			attr_dev(div4, "class", "level");
			add_location(div4, file$2, 54, 2, 1204);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div4, anchor);
			append_dev(div4, div1);
			append_dev(div1, div0);
			append_dev(div0, p0);
			append_dev(div0, t1);
			append_dev(div0, textarea);
			set_input_value(textarea, /*modal_column*/ ctx[1].description);
			append_dev(div4, t2);
			append_dev(div4, div3);
			append_dev(div3, div2);
			append_dev(div2, p1);
			append_dev(div2, t4);
			append_dev(div2, p2);
			append_dev(p2, t5);
			dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[7]);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*modal_column*/ 2) {
				set_input_value(textarea, /*modal_column*/ ctx[1].description);
			}

			if (dirty & /*modal_column*/ 2 && t5_value !== (t5_value = /*modal_column*/ ctx[1].tags + "")) set_data_dev(t5, t5_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div4);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot.name,
		type: "slot",
		source: "(54:1) <ColumnModal table={table} column={modal_column} {save} {close}>",
		ctx
	});

	return block;
}

// (88:4) {#each table.columns as column, i}
function create_each_block(ctx) {
	let tr;
	let td0;
	let t0_value = /*column*/ ctx[8].column_name + "";
	let t0;
	let t1;
	let td1;
	let t2_value = /*column*/ ctx[8].column_type + "";
	let t2;
	let t3;
	let td2;
	let div0;
	let p0;
	let t5;
	let p1;
	let t6_value = /*column*/ ctx[8].description + "";
	let t6;
	let t7;
	let td3;
	let div1;
	let p2;
	let t9;
	let p3;
	let t10_value = /*column*/ ctx[8].tags + "";
	let t10;
	let t11;
	let td4;
	let ion_icon;
	let t12;
	let dispose;

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
			div0 = element("div");
			p0 = element("p");
			p0.textContent = "description";
			t5 = space();
			p1 = element("p");
			t6 = text(t6_value);
			t7 = space();
			td3 = element("td");
			div1 = element("div");
			p2 = element("p");
			p2.textContent = "tags";
			t9 = space();
			p3 = element("p");
			t10 = text(t10_value);
			t11 = space();
			td4 = element("td");
			ion_icon = element("ion-icon");
			t12 = space();
			attr_dev(td0, "class", "has-text-centered svelte-abtnyv");
			add_location(td0, file$2, 89, 6, 2242);
			attr_dev(td1, "class", "has-text-centered svelte-abtnyv");
			add_location(td1, file$2, 90, 6, 2304);
			attr_dev(p0, "class", "heading");
			add_location(p0, file$2, 93, 8, 2462);
			attr_dev(p1, "class", "");
			add_location(p1, file$2, 94, 8, 2505);
			attr_dev(div0, "class", "level-item has-text-centered column");
			add_location(div0, file$2, 92, 7, 2404);
			attr_dev(td2, "class", "has-text-centered svelte-abtnyv");
			add_location(td2, file$2, 91, 6, 2366);
			attr_dev(p2, "class", "heading");
			add_location(p2, file$2, 99, 8, 2670);
			attr_dev(p3, "class", "");
			add_location(p3, file$2, 100, 8, 2706);
			attr_dev(div1, "class", "level-item has-text-centered column");
			add_location(div1, file$2, 98, 7, 2612);
			attr_dev(td3, "class", "has-text-centered svelte-abtnyv");
			add_location(td3, file$2, 97, 6, 2574);
			set_custom_element_data(ion_icon, "name", "ellipsis-horizontal-outline");
			set_custom_element_data(ion_icon, "class", "icon is-medium");
			add_location(ion_icon, file$2, 104, 7, 2806);
			attr_dev(td4, "class", "has-text-centered svelte-abtnyv");
			add_location(td4, file$2, 103, 6, 2768);
			attr_dev(tr, "class", "svelte-abtnyv");
			add_location(tr, file$2, 88, 5, 2231);
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
			append_dev(td2, div0);
			append_dev(div0, p0);
			append_dev(div0, t5);
			append_dev(div0, p1);
			append_dev(p1, t6);
			append_dev(tr, t7);
			append_dev(tr, td3);
			append_dev(td3, div1);
			append_dev(div1, p2);
			append_dev(div1, t9);
			append_dev(div1, p3);
			append_dev(p3, t10);
			append_dev(tr, t11);
			append_dev(tr, td4);
			append_dev(td4, ion_icon);
			append_dev(tr, t12);
			dispose = listen_dev(ion_icon, "click", /*pop_modal*/ ctx[2](/*i*/ ctx[10]), false, false, false);
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty & /*table*/ 1 && t0_value !== (t0_value = /*column*/ ctx[8].column_name + "")) set_data_dev(t0, t0_value);
			if (dirty & /*table*/ 1 && t2_value !== (t2_value = /*column*/ ctx[8].column_type + "")) set_data_dev(t2, t2_value);
			if (dirty & /*table*/ 1 && t6_value !== (t6_value = /*column*/ ctx[8].description + "")) set_data_dev(t6, t6_value);
			if (dirty & /*table*/ 1 && t10_value !== (t10_value = /*column*/ ctx[8].tags + "")) set_data_dev(t10, t10_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(tr);
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block.name,
		type: "each",
		source: "(88:4) {#each table.columns as column, i}",
		ctx
	});

	return block;
}

function create_fragment$3(ctx) {
	let title_value;
	let t0;
	let t1;
	let div2;
	let p0;
	let t2_value = /*table*/ ctx[0].schemaname + "";
	let t2;
	let t3;
	let t4_value = /*table*/ ctx[0].tablename + "";
	let t4;
	let t5;
	let p1;
	let t6_value = (/*table*/ ctx[0].description || "") + "";
	let t6;
	let t7;
	let div0;
	let t8;
	let div1;
	let table_1;
	let thead;
	let tr;
	let th0;
	let p2;
	let t10;
	let th1;
	let t12;
	let th2;
	let t14;
	let tbody;
	let current;
	document.title = title_value = "Altitude: " + /*table*/ ctx[0].name;
	let if_block = /*modal_column*/ ctx[1] && create_if_block(ctx);
	let each_value = /*table*/ ctx[0].columns;
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const block = {
		c: function create() {
			t0 = space();
			if (if_block) if_block.c();
			t1 = space();
			div2 = element("div");
			p0 = element("p");
			t2 = text(t2_value);
			t3 = text(".");
			t4 = text(t4_value);
			t5 = space();
			p1 = element("p");
			t6 = text(t6_value);
			t7 = space();
			div0 = element("div");
			t8 = space();
			div1 = element("div");
			table_1 = element("table");
			thead = element("thead");
			tr = element("tr");
			th0 = element("th");
			p2 = element("p");
			p2.textContent = "Column";
			t10 = space();
			th1 = element("th");
			th1.textContent = "Type";
			t12 = space();
			th2 = element("th");
			th2.textContent = "Other information";
			t14 = space();
			tbody = element("tbody");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr_dev(p0, "class", "panel-heading");
			add_location(p0, file$2, 73, 1, 1746);
			attr_dev(p1, "class", "panel-block description svelte-abtnyv");
			add_location(p1, file$2, 74, 1, 1813);
			attr_dev(div0, "class", "level");
			add_location(div0, file$2, 76, 1, 1880);
			attr_dev(p2, "class", "subtitle");
			add_location(p2, file$2, 81, 44, 1987);
			attr_dev(th0, "class", "subtitle has-text-centered svelte-abtnyv");
			add_location(th0, file$2, 81, 5, 1948);
			attr_dev(th1, "class", "subtitle has-text-centered svelte-abtnyv");
			add_location(th1, file$2, 82, 5, 2028);
			attr_dev(th2, "class", "subtitle has-text-centered svelte-abtnyv");
			attr_dev(th2, "colspan", "3");
			add_location(th2, file$2, 83, 5, 2082);
			attr_dev(tr, "class", "svelte-abtnyv");
			add_location(tr, file$2, 80, 4, 1938);
			add_location(thead, file$2, 79, 3, 1926);
			add_location(tbody, file$2, 86, 3, 2179);
			attr_dev(table_1, "class", "svelte-abtnyv");
			add_location(table_1, file$2, 78, 2, 1915);
			add_location(div1, file$2, 77, 1, 1907);
			attr_dev(div2, "class", "panel is-primary");
			add_location(div2, file$2, 72, 0, 1714);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t0, anchor);
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, div2, anchor);
			append_dev(div2, p0);
			append_dev(p0, t2);
			append_dev(p0, t3);
			append_dev(p0, t4);
			append_dev(div2, t5);
			append_dev(div2, p1);
			append_dev(p1, t6);
			append_dev(div2, t7);
			append_dev(div2, div0);
			append_dev(div2, t8);
			append_dev(div2, div1);
			append_dev(div1, table_1);
			append_dev(table_1, thead);
			append_dev(thead, tr);
			append_dev(tr, th0);
			append_dev(th0, p2);
			append_dev(tr, t10);
			append_dev(tr, th1);
			append_dev(tr, t12);
			append_dev(tr, th2);
			append_dev(table_1, t14);
			append_dev(table_1, tbody);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tbody, null);
			}

			current = true;
		},
		p: function update(ctx, [dirty]) {
			if ((!current || dirty & /*table*/ 1) && title_value !== (title_value = "Altitude: " + /*table*/ ctx[0].name)) {
				document.title = title_value;
			}

			if (/*modal_column*/ ctx[1]) {
				if (if_block) {
					if_block.p(ctx, dirty);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(t1.parentNode, t1);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}

			if ((!current || dirty & /*table*/ 1) && t2_value !== (t2_value = /*table*/ ctx[0].schemaname + "")) set_data_dev(t2, t2_value);
			if ((!current || dirty & /*table*/ 1) && t4_value !== (t4_value = /*table*/ ctx[0].tablename + "")) set_data_dev(t4, t4_value);
			if ((!current || dirty & /*table*/ 1) && t6_value !== (t6_value = (/*table*/ ctx[0].description || "") + "")) set_data_dev(t6, t6_value);

			if (dirty & /*pop_modal, table*/ 5) {
				each_value = /*table*/ ctx[0].columns;
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tbody, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
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
			if (detaching) detach_dev(t0);
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(div2);
			destroy_each(each_blocks, detaching);
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
	let { table_id } = $$props;
	let table = { columns: [] };
	let modal_column;

	const get_table_metadata = async table_id => {
		const response = await fetch(`/tables/${table_id}.json`).then(resp => resp.json());
		$$invalidate(0, table = response);
	};

	function pop_modal(i) {
		return () => {
			$$invalidate(1, modal_column = table.columns[i]);
		};
	}

	onMount(() => {
		get_table_metadata(table_id);
	});

	let save = () => {
		if (modal_column) {
			// somewhat roundabout because we need to mutate
			// the original page as well as the modal content
			table.columns.forEach(column => {
				if (column.column_name == modal_column.column_name) {
					column.description = modal_column.description;
				}
			});

			fetch(`/tables/${table.schemaname}.${table.tablename}`, {
				method: "POST",
				body: JSON.stringify({ table })
			}).then(() => $$invalidate(0, table));
		}
	};

	let close = () => $$invalidate(1, modal_column = undefined);
	const writable_props = ["table_id"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Table> was created with unknown prop '${key}'`);
	});

	function textarea_input_handler() {
		modal_column.description = this.value;
		$$invalidate(1, modal_column);
	}

	$$self.$set = $$props => {
		if ("table_id" in $$props) $$invalidate(5, table_id = $$props.table_id);
	};

	$$self.$capture_state = () => {
		return {
			table_id,
			table,
			modal_column,
			save,
			close
		};
	};

	$$self.$inject_state = $$props => {
		if ("table_id" in $$props) $$invalidate(5, table_id = $$props.table_id);
		if ("table" in $$props) $$invalidate(0, table = $$props.table);
		if ("modal_column" in $$props) $$invalidate(1, modal_column = $$props.modal_column);
		if ("save" in $$props) $$invalidate(3, save = $$props.save);
		if ("close" in $$props) $$invalidate(4, close = $$props.close);
	};

	return [
		table,
		modal_column,
		pop_modal,
		save,
		close,
		table_id,
		get_table_metadata,
		textarea_input_handler
	];
}

class Table extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$2, create_fragment$3, safe_not_equal, { table_id: 5 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Table",
			options,
			id: create_fragment$3.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*table_id*/ ctx[5] === undefined && !("table_id" in props)) {
			console.warn("<Table> was created without expected prop 'table_id'");
		}
	}

	get table_id() {
		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set table_id(value) {
		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/Tables.svelte generated by Svelte v3.18.1 */
const file$3 = "src/Tables.svelte";

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[2] = list[i];
	return child_ctx;
}

// (35:8) {#each tables as table}
function create_each_block$1(ctx) {
	let a;
	let div0;
	let p0;
	let t1;
	let p1;
	let t2_value = /*table*/ ctx[2].schemaname + "";
	let t2;
	let t3;
	let t4_value = /*table*/ ctx[2].tablename + "";
	let t4;
	let t5;
	let div1;
	let p2;
	let t7;
	let p3;
	let t8_value = /*table*/ ctx[2].columns.length + "";
	let t8;
	let t9;
	let div2;
	let p4;
	let t11;
	let p5;
	let t12_value = (/*table*/ ctx[2].description || "None") + "";
	let t12;
	let t13;
	let div3;
	let p6;
	let t15;
	let p7;
	let t16_value = (/*table*/ ctx[2].tags || "None") + "";
	let t16;
	let t17;
	let div4;
	let p8;
	let t19;
	let p9;
	let t20_value = (/*table*/ ctx[2].last_used || "N/A") + "";
	let t20;
	let t21;
	let a_href_value;

	const block = {
		c: function create() {
			a = element("a");
			div0 = element("div");
			p0 = element("p");
			p0.textContent = "table";
			t1 = space();
			p1 = element("p");
			t2 = text(t2_value);
			t3 = text(".");
			t4 = text(t4_value);
			t5 = space();
			div1 = element("div");
			p2 = element("p");
			p2.textContent = "columns";
			t7 = space();
			p3 = element("p");
			t8 = text(t8_value);
			t9 = space();
			div2 = element("div");
			p4 = element("p");
			p4.textContent = "description";
			t11 = space();
			p5 = element("p");
			t12 = text(t12_value);
			t13 = space();
			div3 = element("div");
			p6 = element("p");
			p6.textContent = "tags";
			t15 = space();
			p7 = element("p");
			t16 = text(t16_value);
			t17 = space();
			div4 = element("div");
			p8 = element("p");
			p8.textContent = "last_used";
			t19 = space();
			p9 = element("p");
			t20 = text(t20_value);
			t21 = space();
			attr_dev(p0, "class", "heading");
			add_location(p0, file$3, 37, 20, 1065);
			attr_dev(p1, "class", "subtitle");
			add_location(p1, file$3, 38, 20, 1114);
			attr_dev(div0, "class", "level-item has-text-centered column");
			add_location(div0, file$3, 36, 16, 995);
			attr_dev(p2, "class", "heading");
			add_location(p2, file$3, 41, 20, 1284);
			attr_dev(p3, "class", "subtitle");
			add_location(p3, file$3, 42, 20, 1335);
			attr_dev(div1, "class", "level-item has-text-centered column");
			add_location(div1, file$3, 40, 16, 1214);
			attr_dev(p4, "class", "heading");
			add_location(p4, file$3, 45, 20, 1491);
			attr_dev(p5, "class", "subtitle");
			add_location(p5, file$3, 46, 20, 1546);
			attr_dev(div2, "class", "level-item has-text-centered column");
			add_location(div2, file$3, 44, 16, 1421);
			attr_dev(p6, "class", "heading");
			add_location(p6, file$3, 49, 20, 1709);
			attr_dev(p7, "class", "subtitle");
			add_location(p7, file$3, 50, 20, 1757);
			attr_dev(div3, "class", "level-item has-text-centered column");
			add_location(div3, file$3, 48, 16, 1639);
			attr_dev(p8, "class", "heading");
			add_location(p8, file$3, 53, 20, 1913);
			attr_dev(p9, "class", "subtitle");
			add_location(p9, file$3, 54, 20, 1966);
			attr_dev(div4, "class", "level-item has-text-centered column");
			add_location(div4, file$3, 52, 16, 1843);
			attr_dev(a, "href", a_href_value = "/tables/" + /*table*/ ctx[2].schemaname + "." + /*table*/ ctx[2].tablename);
			attr_dev(a, "class", "level table svelte-12dzaya");
			add_location(a, file$3, 35, 12, 903);
		},
		m: function mount(target, anchor) {
			insert_dev(target, a, anchor);
			append_dev(a, div0);
			append_dev(div0, p0);
			append_dev(div0, t1);
			append_dev(div0, p1);
			append_dev(p1, t2);
			append_dev(p1, t3);
			append_dev(p1, t4);
			append_dev(a, t5);
			append_dev(a, div1);
			append_dev(div1, p2);
			append_dev(div1, t7);
			append_dev(div1, p3);
			append_dev(p3, t8);
			append_dev(a, t9);
			append_dev(a, div2);
			append_dev(div2, p4);
			append_dev(div2, t11);
			append_dev(div2, p5);
			append_dev(p5, t12);
			append_dev(a, t13);
			append_dev(a, div3);
			append_dev(div3, p6);
			append_dev(div3, t15);
			append_dev(div3, p7);
			append_dev(p7, t16);
			append_dev(a, t17);
			append_dev(a, div4);
			append_dev(div4, p8);
			append_dev(div4, t19);
			append_dev(div4, p9);
			append_dev(p9, t20);
			append_dev(a, t21);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*tables*/ 1 && t2_value !== (t2_value = /*table*/ ctx[2].schemaname + "")) set_data_dev(t2, t2_value);
			if (dirty & /*tables*/ 1 && t4_value !== (t4_value = /*table*/ ctx[2].tablename + "")) set_data_dev(t4, t4_value);
			if (dirty & /*tables*/ 1 && t8_value !== (t8_value = /*table*/ ctx[2].columns.length + "")) set_data_dev(t8, t8_value);
			if (dirty & /*tables*/ 1 && t12_value !== (t12_value = (/*table*/ ctx[2].description || "None") + "")) set_data_dev(t12, t12_value);
			if (dirty & /*tables*/ 1 && t16_value !== (t16_value = (/*table*/ ctx[2].tags || "None") + "")) set_data_dev(t16, t16_value);
			if (dirty & /*tables*/ 1 && t20_value !== (t20_value = (/*table*/ ctx[2].last_used || "N/A") + "")) set_data_dev(t20, t20_value);

			if (dirty & /*tables*/ 1 && a_href_value !== (a_href_value = "/tables/" + /*table*/ ctx[2].schemaname + "." + /*table*/ ctx[2].tablename)) {
				attr_dev(a, "href", a_href_value);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(a);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block$1.name,
		type: "each",
		source: "(35:8) {#each tables as table}",
		ctx
	});

	return block;
}

function create_fragment$4(ctx) {
	let t0;
	let div4;
	let p0;
	let t2;
	let div0;
	let p1;
	let input;
	let t3;
	let span;
	let i;
	let t4;
	let div1;
	let h3;
	let t6;
	let div2;
	let t7;
	let div3;
	let each_value = /*tables*/ ctx[0];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
	}

	const block = {
		c: function create() {
			t0 = space();
			div4 = element("div");
			p0 = element("p");
			p0.textContent = "Tables";
			t2 = space();
			div0 = element("div");
			p1 = element("p");
			input = element("input");
			t3 = space();
			span = element("span");
			i = element("i");
			t4 = space();
			div1 = element("div");
			h3 = element("h3");
			h3.textContent = "Most popular tables matching your search";
			t6 = space();
			div2 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t7 = space();
			div3 = element("div");
			document.title = "Altitude: Discover";
			attr_dev(p0, "class", "panel-heading");
			add_location(p0, file$3, 21, 1, 412);
			attr_dev(input, "class", "input");
			attr_dev(input, "type", "text");
			attr_dev(input, "placeholder", "Search");
			add_location(input, file$3, 24, 8, 529);
			attr_dev(i, "class", "fas fa-search");
			attr_dev(i, "aria-hidden", "true");
			add_location(i, file$3, 26, 12, 632);
			attr_dev(span, "class", "icon is-left");
			add_location(span, file$3, 25, 8, 592);
			attr_dev(p1, "class", "control has-icons-left");
			add_location(p1, file$3, 23, 8, 486);
			attr_dev(div0, "class", "panel-block");
			add_location(div0, file$3, 22, 4, 452);
			add_location(h3, file$3, 31, 8, 771);
			attr_dev(div1, "class", "panel-block description svelte-12dzaya");
			add_location(div1, file$3, 30, 4, 725);
			attr_dev(div2, "class", "full-height");
			add_location(div2, file$3, 33, 1, 833);
			attr_dev(div3, "class", "level");
			add_location(div3, file$3, 59, 1, 2082);
			attr_dev(div4, "class", "panel svelte-12dzaya");
			add_location(div4, file$3, 20, 0, 391);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t0, anchor);
			insert_dev(target, div4, anchor);
			append_dev(div4, p0);
			append_dev(div4, t2);
			append_dev(div4, div0);
			append_dev(div0, p1);
			append_dev(p1, input);
			append_dev(p1, t3);
			append_dev(p1, span);
			append_dev(span, i);
			append_dev(div4, t4);
			append_dev(div4, div1);
			append_dev(div1, h3);
			append_dev(div4, t6);
			append_dev(div4, div2);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div2, null);
			}

			append_dev(div4, t7);
			append_dev(div4, div3);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*tables*/ 1) {
				each_value = /*tables*/ ctx[0];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$1(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div2, null);
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
			if (detaching) detach_dev(div4);
			destroy_each(each_blocks, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$4.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$3($$self, $$props, $$invalidate) {
	let tables = [];

	const get_tables_metadata = async () => {
		const response = await fetch(`/tables.json`).then(resp => resp.json());
		$$invalidate(0, tables = response);
		console.log(tables);
	};

	onMount(() => {
		get_tables_metadata();
	});

	$$self.$capture_state = () => {
		return {};
	};

	$$self.$inject_state = $$props => {
		if ("tables" in $$props) $$invalidate(0, tables = $$props.tables);
	};

	return [tables];
}

class Tables extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$3, create_fragment$4, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Tables",
			options,
			id: create_fragment$4.name
		});
	}
}

/* src/App.svelte generated by Svelte v3.18.1 */
const file$4 = "src/App.svelte";

// (15:1) {:else}
function create_else_block(ctx) {
	let h1;

	const block = {
		c: function create() {
			h1 = element("h1");
			h1.textContent = "Hello! Try navigating to discover available data!";
			attr_dev(h1, "class", "svelte-4iepu8");
			add_location(h1, file$4, 15, 2, 274);
		},
		m: function mount(target, anchor) {
			insert_dev(target, h1, anchor);
		},
		p: noop,
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
		source: "(15:1) {:else}",
		ctx
	});

	return block;
}

// (13:27) 
function create_if_block_1(ctx) {
	let current;
	const tables = new Tables({ $$inline: true });

	const block = {
		c: function create() {
			create_component(tables.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(tables, target, anchor);
			current = true;
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(tables.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(tables.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(tables, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1.name,
		type: "if",
		source: "(13:27) ",
		ctx
	});

	return block;
}

// (11:1) {#if sel == "table"}
function create_if_block$1(ctx) {
	let current;

	const table = new Table({
			props: { table_id: /*table_id*/ ctx[1] },
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(table.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(table, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const table_changes = {};
			if (dirty & /*table_id*/ 2) table_changes.table_id = /*table_id*/ ctx[1];
			table.$set(table_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(table.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(table.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(table, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$1.name,
		type: "if",
		source: "(11:1) {#if sel == \\\"table\\\"}",
		ctx
	});

	return block;
}

// (9:0) <Layout>
function create_default_slot$1(ctx) {
	let main;
	let current_block_type_index;
	let if_block;
	let current;
	const if_block_creators = [create_if_block$1, create_if_block_1, create_else_block];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*sel*/ ctx[0] == "table") return 0;
		if (/*sel*/ ctx[0] == "tables") return 1;
		return 2;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	const block = {
		c: function create() {
			main = element("main");
			if_block.c();
			attr_dev(main, "class", "svelte-4iepu8");
			add_location(main, file$4, 9, 1, 170);
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
		id: create_default_slot$1.name,
		type: "slot",
		source: "(9:0) <Layout>",
		ctx
	});

	return block;
}

function create_fragment$5(ctx) {
	let current;

	const layout = new Layout({
			props: {
				$$slots: { default: [create_default_slot$1] },
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

			if (dirty & /*$$scope, table_id, sel*/ 7) {
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
		id: create_fragment$5.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$4($$self, $$props, $$invalidate) {
	let { sel } = $$props, { table_id } = $$props;
	const writable_props = ["sel", "table_id"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("sel" in $$props) $$invalidate(0, sel = $$props.sel);
		if ("table_id" in $$props) $$invalidate(1, table_id = $$props.table_id);
	};

	$$self.$capture_state = () => {
		return { sel, table_id };
	};

	$$self.$inject_state = $$props => {
		if ("sel" in $$props) $$invalidate(0, sel = $$props.sel);
		if ("table_id" in $$props) $$invalidate(1, table_id = $$props.table_id);
	};

	return [sel, table_id];
}

class App extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$4, create_fragment$5, safe_not_equal, { sel: 0, table_id: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "App",
			options,
			id: create_fragment$5.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*sel*/ ctx[0] === undefined && !("sel" in props)) {
			console.warn("<App> was created without expected prop 'sel'");
		}

		if (/*table_id*/ ctx[1] === undefined && !("table_id" in props)) {
			console.warn("<App> was created without expected prop 'table_id'");
		}
	}

	get sel() {
		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set sel(value) {
		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get table_id() {
		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set table_id(value) {
		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

export { App };
//# sourceMappingURL=bundle.js.map
