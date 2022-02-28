{ pkgs ? import <nixpkgs> {} }:
with pkgs;

let
  python-with-my-packages = python310.withPackages (p: with p; [
  ]);
in

mkShell {
  buildInputs = [
    clang
    gnumake
    lld
    nodejs-16_x
    pkg-config
    python310
    poetry
    postgresql.lib
    zlib.dev
  ];

  shellHook = ''
    PYTHONPATH=${python-with-my-packages}/${python-with-my-packages.sitePackages}
  '';
}
