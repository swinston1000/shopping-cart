function ShoppingCartApp() {

    // an array with all of our cart items
    var cart = {
        items: [],
        total: 0
    };

    var renderCart = function() {
        cart.total = cart.items.reduce(function(prev, next) {
            return prev + next.price * next.quantity
        }, 0)

        $(".shopping-cart").empty()
        var source = $('#shopping-cart-template').html();
        var template = Handlebars.compile(source);
        var newHTML = template(cart);
        $(".shopping-cart").append(newHTML);
    }


    var addItem = function(item) {

        var index = cart.items.indexOf(item)
            //if the item is not in the cart then add it and set quantity to one
            //else increase quantity
        if (index === -1) {
            item.quantity = 1;
            cart.items.push(item);
        } else {
            cart.items[index].quantity++
        }
        console.log(cart.items);
        renderCart();
    }

    var removeItem = function(item) {
        cart.items.forEach(function(cartitem) {
            if (item === cartitem.name && cartitem.quantity > 1) {
                cartitem.quantity--;
            } else if (item === cartitem.name && cartitem.quantity === 1) {
                //remove the item from the array completely
                cart.items.splice(cart.items.indexOf(cartitem), 1);
            }
        })
        renderCart();
    }

    var clearCart = function() {
        cart = {
            items: [],
            total: 0
        };
        renderCart();
    }

    return {
        renderCart: renderCart,
        addItem: addItem,
        clearCart: clearCart,
        removeItem: removeItem
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

$('.shopping-cart').on('click', '.clear-cart', function() {
    app.clearCart();
    $(".shopping-cart").removeClass('show')
});

$('.shopping-cart').on('click', '.remove', function() {
    app.removeItem($(this).closest('.item').data().item)
});

$(window).click(function() {
    if ($(".shopping-cart").hasClass('show')) {
        $(".shopping-cart").removeClass('show');
    }
});

$(".shopping-cart").click(function(event) {
    event.stopPropagation();
});

// update the cart as soon as the page loads!
app.renderCart();
