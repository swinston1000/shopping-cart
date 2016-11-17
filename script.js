function ShoppingCartApp() {

    var cart = {};

    var store = {};

    var CART_STORE = 'shopping_cart';
    var ITEM_STORE = 'item_store';

    var getFromLocalStorage = function() {
        //if there is no cart then set it up!
        cart = JSON.parse(localStorage.getItem(CART_STORE) || '{"items": [],"total": 0}');
        store = JSON.parse(localStorage.getItem(ITEM_STORE) || '{"id":6,"items":[{"name":"Glass","price":68,"image":"http://ecx.images-amazon.com/images/I/31AOX24ATKL.jpg","id":0},{"name":"Pencils","price":3,"image":"http://ecx.images-amazon.com/images/I/51YFEe%2BCYbL.jpg","id":1},{"name":"Kinfolk","price":21,"image":"http://ecx.images-amazon.com/images/I/41m0VhULItL.jpg","id":2},{"name":"Book","price":25,"image":"http://ecx.images-amazon.com/images/I/41uyfSEwr0L.jpg","id":3},{"name":"Pipe","price":124,"image":"http://ecx.images-amazon.com/images/I/41TvbxcZpZL.jpg","id":4},{"name":"Stool","price":92,"image":"http://ecx.images-amazon.com/images/I/41NZO5GovmL.jpg","id":5}]}');
        //console.log(store);
    }
    var _saveToLocalStorage = function() {
        localStorage.setItem(CART_STORE, JSON.stringify(cart));
        localStorage.setItem(ITEM_STORE, JSON.stringify(store));
    }

    var renderItems = function() {
        $("#store-container").empty()
        store.items.forEach(function(item) {
            var source = $('#item-template').html();
            var template = Handlebars.compile(source);
            var newHTML = template(item);
            //add the html to the  container
            $("#store-container").append(newHTML);
        })
    }

    var renderCart = function() {
        $(".shopping-cart").empty()
        var source = $('#shopping-cart-template').html();
        var template = Handlebars.compile(source);
        var newHTML = template(cart);
        $(".shopping-cart").append(newHTML);
    }


    var addItem = function(item) {
        var matchedIndex = cart.items.findIndex(function(element) {
            return element.id === item.id;
        });

        if (matchedIndex != -1) {
            cart.items[matchedIndex].quantity++
        } else {
            item.quantity = 1;
            cart.items.push(item);
        }

        //update the total
        cart.total = cart.items.reduce(function(prev, next) {
            return prev + next.price * next.quantity
        }, 0)

        _saveToLocalStorage();
        renderCart();

    }

    var removeItem = function(btn) {
        var itemID = $(btn).closest('.item').data().id;
        cart.items.forEach(function(cartitem) {
            if (itemID === cartitem.id && cartitem.quantity > 1) {
                cartitem.quantity--;
            } else if (itemID === cartitem.id && cartitem.quantity === 1) {
                //remove the item from the array completely
                cart.items.splice(cart.items.indexOf(cartitem), 1);
            }
        })
        _saveToLocalStorage();
        renderCart();
    }

    var clearCart = function() {
        cart = {
            items: [],
            total: 0
        };
        _saveToLocalStorage();
        renderCart();
    }

    return {
        renderItems: renderItems,
        renderCart: renderCart,
        addItem: addItem,
        clearCart: clearCart,
        removeItem: removeItem,
        getFromLocalStorage: getFromLocalStorage
    }
}

$('#header').load('./header.html');

var app = ShoppingCartApp();

//turns off shopping cart when anywhere on the window is clicked!
$(window).click(function() {
    if ($(".shopping-cart").hasClass('show')) {
        $(".shopping-cart").removeClass('show');
    }
});

$(document).ready(function() {

    app.getFromLocalStorage();

    var location = this.location.pathname
    if (location.indexOf('index') != -1) {
        app.renderItems();
        setupAddItemListener()
    } else if (location.indexOf('admin') != -1) {
        //setup parsley for admin form
        var form = $('#item-form').parsley();
    }
    // update the cart as soon as the index page loads!
    app.renderCart();
    setupCartListeners()
    highlightNavBar(location)
});

function highlightNavBar(location) {
    var navLinks = $('nav li a').each(function(i, link) {
        var href = $(link).attr('href');
        if (location.indexOf(href) != -1) {
            $(link).closest('li').addClass('active')
        }
    })
}

function setupAddItemListener() {
    $('.add-to-cart').on('click', function(e) {
        e.stopPropagation();
        var item = $(this).closest(".item").data();
        //item = Object.create($(this).closest(".item").data())
        //debugger;
        app.addItem(item);
        $(".shopping-cart").addClass('show')
    });
}

function setupCartListeners() {
    $('.view-cart').on('click', function() {
        $(".shopping-cart").toggleClass('show')
    });

    $('.shopping-cart').on('click', '.clear-cart', function() {
        app.clearCart();
        $(".shopping-cart").removeClass('show')
    });

    $('.shopping-cart').on('click', '.remove', function() {
        app.removeItem(this)
    });

    $(".shopping-cart").click(function(event) {
        event.stopPropagation();
    });
}
