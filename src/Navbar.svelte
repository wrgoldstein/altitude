<!-- svelte-ignore a11y-missing-attribute
                   a11y-autofocus -->
<nav class="navbar" role="navigation" aria-label="main navigation">
  <div class="navbar-brand">
        <span class="icon is-large">
            <ion-icon name="airplane-outline"></ion-icon>
        </span>


    <a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </a>
  </div>

  <div id="navbarBasicExample" class="navbar-menu">
    <div class="navbar-start">
      <a href="/" class="navbar-item">
        Home
      </a>

      <a href="/tables" class="navbar-item">
        Tables
      </a>
    </div>

    <div class="navbar-end">
      <div class="navbar-item">
        <div class="buttons">
          <!-- <a href="" class="button is-primary">
            <strong>Sign up</strong>
          </a>
          <a href="" class="button is-light">
            Log in
          </a> -->
        </div>
      </div>
    </div>
  </div>
</nav>

<style>
.logo {
  text-transform: uppercase;
  color: #FF8D8A;
}

a {
  text-decoration: none;
}
</style>