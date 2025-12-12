document.addEventListener('DOMContentLoaded', function() {

    const menuToggle = document.getElementById('menuToggle');

    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {

        menuToggle.addEventListener('click', function(event) {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');

            event.stopPropagation();
        });

        const navLinks = navMenu.querySelectorAll('a');

        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });

        document.addEventListener('click', function(event) {
            if (navMenu.classList.contains('active')) {
                if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                    navMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                }
            }
        });

        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });

    } else {
        console.error('ERROR: No se encontraron los elementos del menú. Verifica los IDs en el HTML.');
    }

});

document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        if (href !== '#') {
            e.preventDefault();

            const target = document.querySelector(href);

            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;

                const targetPosition = target.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

document.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');

    const navLinks = document.querySelectorAll('#navMenu a[href^="#"]');

    let scrollY = window.scrollY + 150;

    sections.forEach(sec => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        const id = sec.getAttribute('id');

        const link = document.querySelector(`#navMenu a[href="#${id}"]`);

        if (scrollY >= top && scrollY < top + height) {
            navLinks.forEach(l => l.classList.remove('activo-scroll'));

            if (link) {
                link.classList.add('activo-scroll');
            }
        }
    });

    if (window.scrollY < 100) {
        navLinks.forEach(l => l.classList.remove('activo-scroll'));
        const inicioLink = document.querySelector('#navMenu a[href="#inicio"]');
        if (inicioLink) {
            inicioLink.classList.add('activo-scroll');
        }
    }
});

