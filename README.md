# @foxglove/xmlrpc

TypeScript library implementing an XMLRPC client and server with pluggable server backend.

## License

@foxglove/xmlrpc is released under the [MIT License](/LICENSE.md).

## Releasing

```sh
tag=$(npm version minor) && echo "$tag"
git push && git push origin "$tag"
```
