function ShoppingCartApp() {

    var cart = {};

    var store = {};

    var CART_STORE = 'shopping_cart';
    var ITEM_STORE = 'item_store';




    function _getFromLocalStorage() {
        //if there is no cart then set it up!
        cart = JSON.parse(localStorage.getItem(CART_STORE) || '{"items": [],"total": 0}');

        var localStore = localStorage.getItem(ITEM_STORE);
        if (localStore) {
            store = JSON.parse(localStore);
        } else {
            $.getJSON("store.json", function(json) {
                store = json
                _saveToLocalStorage()
            });
        };
    }

    _getFromLocalStorage();

    function _saveToLocalStorage() {
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

        // add listener
        $('.add-to-cart').on('click', function(e) {
            e.stopPropagation();
            var item = $(this).closest(".item").data();
            //item = Object.create($(this).closest(".item").data())
            app.addItemToCart(item);
            $(".shopping-cart").addClass('show')
        });
    }

    var renderCart = function() {

        // calculate new total
        cart.total = cart.items.reduce(function(prev, next) {
            return prev + next.price * next.quantity
        }, 0)

        $(".shopping-cart").empty()
        var source = $('#shopping-cart-template').html();
        var template = Handlebars.compile(source);
        var newHTML = template(cart);
        $(".shopping-cart").append(newHTML);
    }


    var addItemToCart = function(item) {
        var matchedIndex = cart.items.findIndex(function(element) {
            return element.id === item.id;
        });

        if (matchedIndex != -1) {
            cart.items[matchedIndex].quantity++
        } else {
            item.quantity = 1;
            cart.items.push(item);
        }

        renderCart();
        _saveToLocalStorage();

    }

    var removeItemFromCart = function(btn) {
        var itemID = $(btn).closest('.item').data().id;
        cart.items.forEach(function(cartitem) {
            if (itemID === cartitem.id && cartitem.quantity > 1) {
                cartitem.quantity--;
            } else if (itemID === cartitem.id && cartitem.quantity === 1) {
                //remove the item from the array completely
                cart.items.splice(cart.items.indexOf(cartitem), 1);
            }
        })
        renderCart();
        _saveToLocalStorage();

    }

    var clearCart = function() {
        cart = {
            items: [],
            total: 0
        };
        renderCart();
        _saveToLocalStorage();

    }

    var addItemToStore = function(item) {
        item.id = store.id++;
        store.items.push(item);
        _saveToLocalStorage();
        renderItemRemoveForm();
    }

    var renderItemRemoveForm = function() {
        $("#remove-item-list").empty();
        var source = $('#remove-item-template').html();
        var template = Handlebars.compile(source);
        store.items.forEach(function(item) {
            var newHTML = template(item);
            $(newHTML).appendTo("#remove-item-list");
        })
    }

    var removeItemFromStore = function(itemID) {
        store.items.forEach(function(item, i) {
            if (item.id === itemID) {
                store.items.splice(i, 1)
                renderItemRemoveForm()
            }
        });
        //TODO: remove item from cart???
        _saveToLocalStorage();
    }

    return {
        renderItems: renderItems,
        renderCart: renderCart,
        addItemToCart: addItemToCart,
        clearCart: clearCart,
        removeItemFromCart: removeItemFromCart,
        addItemToStore: addItemToStore,
        renderItemRemoveForm: renderItemRemoveForm,
        removeItemFromStore: removeItemFromStore
    }
}

var app = ShoppingCartApp();

/***turns off shopping cart when anywhere on the window is clicked!***/
$(window).click(function() {
    if ($(".shopping-cart").hasClass('show')) {
        $(".shopping-cart").removeClass('show');
    }
});

/***load the header and then set up the page according to location***/
$('head').load('header.html', function() {
    if (document.location.pathname.indexOf('admin') != -1) {
        app.renderItemRemoveForm();
        setupFormsAndListeners();
    } else {
        //for any other location render items in the store and add "Add To Cart" Listener
        app.renderItems();
    }
});

function setupFormsAndListeners() {
    // ADD IIEM FORM
    var $form = $('#add-item-form');
    addFileTypeValidator()
    var formValidation = $form.parsley();
    $('#add-item').on('click', function() {
        if (formValidation.validate()) {
            //TODO validate it is an image
            app.addItemToStore({
                name: $("#item-name").val(),
                price: $("#item-price").val(),
                image: $("#item-image").val()
            })
            $('.success-info').attr('style', 'display: block;').fadeOut(5000);
            $form.trigger('reset');
            formValidation.reset();
        }
    });
    // REMOVE IIEM FORM
    $('#remove-item-btn').on('click', function(e) {
        if (confirm('Are you sure you want to remove this item?')) {
            var item = $("#remove-item-list option:selected")[0];
            app.removeItemFromStore($(item).data().id)
        }
    });
}

function addFileTypeValidator() {
    window.Parsley
        .addValidator('filetype', function(value, requirement) {
            var requirements = requirement.split(",")
            var fileExtension = value.split('.').pop();
            return requirements.indexOf(fileExtension) != -1
        })
        .addMessage('en', 'filetype', 'Please only link to images!');
}

/***load the navbar and setup the cart***/
$('#navbar').load('navbar.html', function() {
    app.renderCart();
    setupCartListeners()
    highlightNavBar(document.location.pathname)
})

function setupCartListeners() {
    $('.view-cart').on('click', function() {
        $(".shopping-cart").toggleClass('show')
    });

    $('.shopping-cart').on('click', '.clear-cart', function() {
        app.clearCart();
        $(".shopping-cart").removeClass('show')
    });

    $('.shopping-cart').on('click', '.remove', function() {
        app.removeItemFromCart(this)
    });

    $(".shopping-cart").click(function(event) {
        event.stopPropagation();
    });
}

function highlightNavBar(location) {
    var navLinks = $('nav li a').each(function(i, link) {
        var href = $(link).attr('href');
        if (location.indexOf(href) != -1) {
            $(link).closest('li').addClass('active')
        }
    })
}
