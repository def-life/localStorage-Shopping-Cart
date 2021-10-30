const CART = {
    KEYS: "sajfkhaskdfhsajkdfiweuryjsdbf", // this will act as my key in local Storage 
    contents: [], // this will contain all my cart items and their state
    init: function () {
        let _contents = JSON.parse(localStorage.getItem(CART.KEYS));
        if (_contents) {
            // cart already exists so  earlier state retained
            CART.contents = _contents;
        } else {
            // add initial cart data to the localStorage, its not mandatory, in production it should be empty
            CART.contents = [
                { id: 1, title: 'Apple', qty: 5, itemPrice: 0.85 },
                { id: 2, title: 'Banana', qty: 3, itemPrice: 0.35 },
                { id: 3, title: 'Cherry', qty: 8, itemPrice: 0.05 }
            ];
            CART.sync();
        }
    },

    // this method return index of item if the item exist else returns -1;
    find(id) {
        let index = CART.contents.findIndex((item) => {
            if (item.id === id) {
                return true;
            }
        })

        return index;
    },

    // this method will add a new cart item 
    // i.e you click on new item in UI of products and if that item exist in cart increment else add item and then increment
    add(id) {
        let index = CART.find(id);
        if (index === -1) {
            // the item doesnot exist in the cart
            // you need to add to contents and display
            let product = PRODUCTS.find((product) => {
                if (product.id === id) {
                    return true;
                }
            });

            let cartItem = {
                id: product.id,
                title: product.title,
                qty: 1,
                itemPrice: product.price
            }

            // add to cart
            CART.contents.push(cartItem);
            // update localStorage
            CART.sync();

        } else {
            // the item exist
            CART.increase(id, 1);
        }
    },

    increase(id, qty = 1) {
        CART.contents = CART.contents.map((item) => {
            if (item.id === id) {
                item.qty += qty;
            }
            return item;
        })
        // also update the localStorage
        CART.sync();
    },

    reduce(id, qnty = 1) {
        CART.contents = CART.contents.map((item) => {
            if (item.id === id) {
                item.qty -= qnty;
            }
            return item;
        })

        // if any cartItem quantity is <=0 remove it
        CART.contents = CART.contents.filter((item) => {
            if (item.qty <= 0) {
               
                return false;
            }
            return item;
        })

        // also update the localStorage
        CART.sync();
    },


    // this function will reflect any  change in cart to localStorage
    sync() {
        localStorage.setItem(CART.KEYS, JSON.stringify(CART.contents));
    },

    empty: function () {
        // this will empty the entire cart
        CART.contents = [];
        // reflect this change to the local Storage as well
        CART.sync();
    },

    // this method will sort my contents, the default is based on title
    // shortcut item1[criteria] - item2[criteria] i didnot wrote it just for fun
    sort: function (criteria = "title") {
        CART.contents.sort(function (item1, item2) {
            if (item1[criteria] < item2[criteria]) {
                return -1;
            } else if (item1[criteria] > item2[criteria]) {
                return 1;
            } else {
                return 0;
            }
        })
    },

    // this method is not important for functionality of the store
    logContent(prefix) {
        console.log(prefix, CART.contents);
    }
}

let PRODUCTS = [];
document.addEventListener("DOMContentLoaded", init);

function init() {

    // get all products
    getProducts(success, failure);

    //initialise the cart
    CART.init();

    // show the cart items;
    showCart();

}


function getProducts(success, failure) {
    let url = "products.json";

    // these options i passed are default ones
    fetch(url, {
        method: "GET",
        mode: "cors"
    })
        .then((response) => {
            return response.json();
        })
        .then(success)
        .catch(failure);
}

// success function will show products on webpage
function success(products) {
    // do set the products to the global scoped "PRODUCTS" so that i can use later
    PRODUCTS = products;
    let urlPath = "./images/"
    let df = new DocumentFragment();

    products.forEach((product) => {
        let div = create("div");
        let h1 = create("h1");
        let p = create("p");
        let img = create("img");
        let span = create("span");
        let btn = create("button");

        // adding contents and data-attributes
        btn.setAttribute("data-id", product.id);
        h1.textContent = product.title;
        p.textContent = product.desc;
        img.src = "".concat(urlPath, product.img)
        img.alt = product.title;
        span.textContent = Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(product.price);
        btn.textContent = "Add item";

        // adding event handlers on button

        btn.addEventListener("click", function (ev) {
            ev.preventDefault();
            CART.add(parseInt(ev.currentTarget.dataset.id));
            showCart();
        })

        // adding some css classes
        div.className = "product-item";
        btn.className = "btn";



        // appending the childrens
        div.appendChild(img)
        div.appendChild(h1);
        div.appendChild(p);
        div.appendChild(span);
        div.appendChild(btn);

        df.appendChild(div);
    })

    select(".products").appendChild(df);
}

//
function failure(err) {
    console.log(err);

}

function create(_tagname) {
    return document.createElement(_tagname);
}

function select(cssQuery) {
    return document.querySelector(cssQuery);
}

function showCart() {
    // clear the earlier html
    select(".cart").innerHTML = "";

    // sort the list based on title;
    CART.sort();

    let df = new DocumentFragment();

    CART.contents.forEach((cartItem) => {
        let containerDiv = create("div");
        let h3 = create("h3");
        let div = create("div");
        let plusBtn = create("button");
        let minusBtn = create("button");
        let span = create("span");
        let price = create("span");


        // adding contents
        h3.textContent = cartItem.title;
        span.textContent = cartItem.qty;
        plusBtn.textContent = "+";
        plusBtn.setAttribute("data-id", cartItem.id);
        minusBtn.textContent = "-";
        minusBtn.setAttribute("data-id", cartItem.id);
        let p = cartItem.qty * cartItem.itemPrice;
        price.textContent = Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(p);


        // adding event Handlers

        plusBtn.addEventListener("click", incrementBtn);
        minusBtn.addEventListener("click", decrementBtn);


        /***************************************************************** */
        // adding classes

        span.className = "qnty";
        price.className = "price"

        div.appendChild(plusBtn);
        div.appendChild(span);
        div.appendChild(minusBtn);
        div.appendChild(price);

        containerDiv.appendChild(h3);
        containerDiv.appendChild(div);
        df.appendChild(containerDiv);
    })

    select(".cart").appendChild(df);
}

function incrementBtn(ev) {
    ev.preventDefault();
    let id = parseInt(ev.target.dataset.id);
    CART.increase(id, 1);

    let index = CART.find(id);
    ev.currentTarget.nextElementSibling.textContent = parseInt(CART.contents[index].qty);

    // price
    getPrice(index, ev.target);
}

function decrementBtn(ev) {
    ev.preventDefault();
    let id = parseInt(ev.target.dataset.id);
    CART.reduce(id, 1);

    let index = CART.find(id);


    if (index === -1) {
        // remove the child cart from screen
        select(".cart").removeChild(ev.currentTarget.parentNode.parentNode);
    } else {
        ev.currentTarget.previousElementSibling.textContent = CART.contents[index].qty;
        // price
        getPrice(index, ev.target)
    }

}

function getPrice(index, target) {
    let price = CART.contents[index].qty * parseFloat(CART.contents[index].itemPrice);
    target.parentNode.lastElementChild.textContent = Intl.NumberFormat("en-US", {style: "currency", currency: "USD"}).format(price);
}

