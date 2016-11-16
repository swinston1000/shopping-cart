function ShoppingCartApp() {

    // an array with all of our cart items
    var cart = {
        items: [],
        total: 0
    };

    var renderCart = function() {
        console.log("rendered");
        cart.total = cart.items.reduce(function(prev, next) {
            return prev + next.price
        }, 0)

        $(".shopping-cart").empty()
        var source = $('#shopping-cart-template').html();
        var template = Handlebars.compile(source);
        var newHTML = template(cart);
        $(".shopping-cart").append(newHTML);
    }


    var addItem = function(item) {
        cart.items.push(item)
        renderCart();
    }

    var clearCart = function() {
        cart = {
            items: [],
            total: 0
        };
    }

    return {
        renderCart: renderCart,
        addItem: addItem,
        clearCart: clearCart
    }
}


var app = ShoppingCartApp()

$('.view-cart').on('click', function() {
    $(".shopping-cart").toggleClass('show')
});

$('.add-to-cart').on('click', function() {
    var item = $(this).closest(".item").data()
    app.addItem(item);

});

$('.shopping-cart').on('click', $('.clear-cart'), function() {
    app.clearCart();
    $(".shopping-cart").removeClass('show')
    $(".shopping-cart").empty()
});

// update the cart as soon as the page loads!
app.renderCart();
