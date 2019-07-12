// Modal EXTRAS Menu (instructions and settings)

var extras = {};

extras.modal_extras = document.querySelector('.modal.extras');
extras.closeButton_extras = document.querySelector('.close-modal.extras');
extras.openButton_extras = document.querySelector('.open-modal.extras');
extras.inner_extras = document.querySelector('.modal-inner.extras');
extras.content_extras = document.querySelector('.modal-content.extras');

// set open modal behaviour
extras.openButton_extras.addEventListener('click', function() {
    extras.modal_extras.classList.toggle('modal-open');
});

// set close modal behaviour
extras.closeButton_extras.addEventListener('click', function() {
    extras.modal_extras.classList.toggle('modal-open');
});

// close modal if clicked outside content area
extras.inner_extras.addEventListener('click', function() {
    extras.modal_extras.classList.toggle('modal-open');
});

// prevent modal inner from closing parent when clicked
extras.content_extras.addEventListener('click', function(e) {
    e.stopPropagation();
});

//Settings are part of modal window

extras.toggle_visualizer = document.querySelector('.toggle-visualizer');

extras.toggle_visualizer.addEventListener('click', function () {
    if (extras.toggle_visualizer.classList.contains('on')) {
        //turn off in on
        extras.toggle_visualizer.classList.remove('on');
        extras.toggle_visualizer.classList.add('off');
        extras.toggle_visualizer.innerHTML = 'OFF';
    } else {
        //turn on if off
        extras.toggle_visualizer.classList.remove('off');
        extras.toggle_visualizer.classList.add('on');
        extras.toggle_visualizer.innerHTML = 'ON';
    };
});