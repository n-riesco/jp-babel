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

For example, in Ubuntu 16.04, you can run:

```sh
sudo apt-get install nodejs-legacy npm ipython ipython-notebook
sudo npm install -g jp-babel
```

## babelrc

By default, `jp-babel` is set to use the preset
[babel-preset-env](https://babeljs.io/docs/plugins/preset-env/). Users can
customise their [.babelrc](https://babeljs.io/docs/usage/babelrc/). If they do
so, they must ensure all the referenced plugins and presets can be required from
within the `jp-babel` session.

## Usage

jp-Babel provides 5 executables: `jp-babel-install`,
`jp-babel-notebook`, `jp-babel-console`, `jp-babel-kernel` and `jp-babel`.
Their purpose and basic use is described in the sections below. Please, refer to
the [usage notes](http://n-riesco.github.io/ijavascript/doc/usage.md.html) for
further details.


### `jp-babel-install`: jp-Babel kernel spec installer

'jp-babel-install` registers the jp-Babel kernel with Jupyter, so that
other tools (e.g. the Jupyter notebook) can invoke it. The following command
flags are recognised:

```
--debug                   enable debug messages
--help                    show this help
--hide-undefined          do not show undefined results
--install=[local|global]  install kernel for current user or globally
--protocol=version        set messaging protocol version, e.g. 5.0
--show-undefined          show undefined results
--spec-path=[none|full]   set whether kernel spec uses full paths
--startup-script=path     run script on kernel startup
                          (path can be a file or a folder)
--version                 show kernel version
--versions                show kernel and library versions
--working-dir=path        set kernel working directory
                          (default = current working directory)
```


### `jp-babel-notebook`: jp-Babel notebook

After running `jp-babel-install`, Jupyter notebook users can invoke the Jupyter
notebook as usual. `jp-babel-notebook` is provided for convenience to users of
the IPython notebook prior to version 3. `jp-babel-notebook` is a wrapper
around `ipython notebook`. It extends the command flags accepted by `ipython
notebook` with the following:

```
--help                       show jp-Babel and notebook help
--jp-debug                   enable debug messages
--jp-help                    show this help
--jp-hide-undefined          do not show undefined results
--jp-install=[local|global]  install kernel for current user or globally
--jp-protocol=version        set protocol version, e.g. 5.0
--jp-show-undefined          show undefined results
--jp-spec-path=[none|full]   set whether kernel spec uses full paths
--jp-startup-script=path     run script on startup
                             (path can be a file or a folder)
--jp-working-dir=path        set kernel working directory
                             (default = current working directory)
--version                    show kernel version
--versions                   show kernel and library versions
```


### `jp-babel-console`: jp-Babel console

`jp-babel-console` is provided for convenience to users as a wrapper around
`jupyter console`. The following command flags are recognised:

```
--help                       show jp-Babel and notebook help
--jp-debug                   enable debug messages
--jp-help                    show this help
--jp-hide-undefined          do not show undefined results
--jp-install=[local|global]  install kernel for current user or globally
--jp-protocol=version        set protocol version, e.g. 5.0
--jp-show-undefined          show undefined results
--jp-spec-path=[none|full]   set whether kernel spec uses full paths
--jp-startup-script=path     run script on startup
                             (path can be a file or a folder)
--jp-working-dir=path        set kernel working directory
                             (default = current working directory)
--version                    show kernel version
--versions                   show kernel and library versions
```


### `jp-babel-kernel`: jp-Babel kernel

`jp-babel-kernel` is the executable invoked by Jupyter tools (e.g. the
notebook) and that appears in the kernel spec that `jp-babel-install` creates
for jp-Babel. You won't need this command, unless you want to create a
custom kernel spec.

```
Usage:
    jp-babel-kernel [options] connection_file

Options:
    --debug                           enable debug messages
    --hide-undefined                  do not show undefined results
    --protocol=Major[.minor[.patch]]  set protocol version, e.g. 5.0
    --session-working-dir=path        set session working directory
    --show-undefined                  show undefined results
    --startup-script=path             run script on startup
                                      (path can be a file or a folder)
```


### `jp-babel`: Deprecated CLI

`jp-babel` is provided for backwards-compatibility. It will be removed in the
next major-version update. Please, use `jp-babel-install` or
`jp-babel-notebook` instead.


## Troubleshooting

- **`jp-babel` takes 10-15 seconds on the first execution after kernel start
  (Issue #4)**: This issue has been seen on a system using `npm 2`. As suggested
  [here](http://stackoverflow.com/a/34952713), running `npm dedupe` on the
  folder where `jp-babel` was installed helps reduce this time. Alternatively,
  using `npm 3` to install `jp-babel` also helps.


# Contributions

First of all, thank you for taking the time to contribute. The maintenance of
IJavascript is currently my priority. I would really appreciate some help.
Please, read [CONTRIBUTING](CONTRIBUTING.md) and use the [issue
tracker](https://github.com/n-riesco/jp-babel/issues) for any
contributions: support requests, bug reports, enhancement requests, pull
requests, submission of tutorials...

# TO DO

- Add tests
