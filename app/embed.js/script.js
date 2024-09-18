document.addEventListener('DOMContentLoaded', async () => {
    const checkoutButton = document.querySelector('[data-node-type="cart-checkout-button"]');
    if (!checkoutButton) return;

    // Create a new button element
    const button = document.createElement('button');
    button.innerHTML = checkoutButton.innerHTML;

    // Copy all attributes except 'href' and 'data-node-type'
    Array.from(checkoutButton.attributes).forEach(attr => {
        if (!['href', 'data-node-type'].includes(attr.name)) {
            button.setAttribute(attr.name, attr.value);
        }
    });

    // Replace the original checkout button with the new one
    checkoutButton.replaceWith(button);

    // Store the original button text for restoration
    const originalText = button.innerHTML;
    const loadingText = button.getAttribute('data-loading-text') || 'Processing...';

    button.addEventListener('click', async () => {
        button.innerHTML = loadingText;

        try {
            // Fetch cart items and initiate checkout
            const cartItems = await getCartItems();
            if (cartItems.length === 0) throw new Error('Cart is empty.');

            const response = await fetch(`https://localhost:3000/api/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Wf-Site': getSiteId(),
                },
                body: JSON.stringify({
                    cartItems,
                    redirectUrl: `${window.location.origin}/order-confirmation`,
                }),
            });

            // if (!response.ok) throw new Error('Failed to create checkout session.');

            // const { url } = await response.json();
            // window.location.href = url;
        } catch (error) {
            console.error('Error during checkout:', error);
            alert('An error occurred during checkout. Please try again.');
        } finally {
            // Restore the original button text
            button.innerHTML = originalText;
        }
    });
});

async function getCartItems() {
    try {
        const csrfToken = getCSRFToken();
        const response = await fetch('/.wf_graphql/apollo', {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-wf-csrf': csrfToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([{
                operationName: 'Dynamo2',
                variables: {},
                query: `
                    query Dynamo2 {
                        database {
                            commerceOrder {
                                userItems {
                                    count
                                    sku { id }
                                }
                            }
                        }
                    }`,
            }]),
        });

        const result = await response.json();
        return result[0]?.data?.database?.commerceOrder?.userItems || [];
    } catch (error) {
        console.error('Error fetching cart items:', error);
        return [];
    }
}

function getCSRFToken() {
    const match = document.cookie.match(/csrf=([^;]+)/);
    return match ? match[1] : '';
}

function getSiteId() {
    return document.documentElement.getAttribute('data-wf-site');
}
