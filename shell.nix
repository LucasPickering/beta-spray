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
