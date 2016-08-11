# jp-babel: A babel Kernel for the Jupyter Notebook

jp-babel is an [`npm` package](https://www.npmjs.com/) that implements a
babel kernel for the [Jupyter notebook](http://jupyter.org/)). A Jupyter
notebook combines the creation of rich-text documents (including equations,
plots and videos) with the execution of code in a number of programming
languages.

The execution of code is carried out by means of a kernel that implements the
[Jupyter messaging
protocol](http://ipython.org/ipython-doc/stable/development/messaging.html).
There are kernels available for [Python](http://ipython.org/notebook.html),
[Julia](https://github.com/JuliaLang/IJulia.jl),
[Ruby](https://github.com/minad/iruby),
[Haskell](https://github.com/gibiansky/IHaskell) and [many other
languages](https://github.com/ipython/ipython/wiki/IPython-kernels-for-other-languages).

## Proof-of-Concept and Goals

jp-babel came to existence prompted by a number of requests from
[IJavascript](http://n-riesco.github.io/ijavascript) users. See [this
issue](https://github.com/n-riesco/nel/issues/1) for further details.

By publishing jp-babel I'm seeking to:

- provide users with a "usable" babel kernel that with some support may
  become a fully featured kernel,

- reuse the IJavascript code and develop a Node.js library to implement Jupyter
  kernels for other languages.

## Installation

Please, refer to the [installation notes for
IJavascript](http://n-riesco.github.io/ijavascript/doc/install.md.html).

For example, in Ubuntu 14.04, you can run:

```sh
sudo apt-get install nodejs-legacy npm ipython ipython-notebook libzmq3-dev
sudo npm install -g jp-babel
```

## babelrc

By default, `jp-babel` is set to use the preset
[babel-preset-es2015](https://babeljs.io/docs/plugins/preset-es2015/). Users can
customise their [.babelrc](https://babeljs.io/docs/usage/babelrc/). If they do
so, they must ensure all the referenced plugins and presets can be required from
within the `jp-babel` session.

## Usage

To install the kernel and start an Jupyter notebook session, run:

```sh
jp-babel
```

# Contributions

First of all, thank you for taking the time to contribute. The maintenance of
IJavascript is currently my priority. I would really appreciate some help.
Please, read [CONTRIBUTING](CONTRIBUTING.md) and use the [issue
tracker](https://github.com/n-riesco/jp-babel/issues) for any
contributions: support requests, bug reports, enhancement requests, pull
requests, submission of tutorials...

# TO DO

- Add tests
