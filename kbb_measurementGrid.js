/**
 * Plane geometry node type
 *
 * @author Klaus Blass / http://evolving-concepts.com
 *
 * based on "geometry/plane",
 * allows passing in z-values of the vertices
 * which can represent measurement values associated with the x,y coordinates.
 * A vertex shader can then use these z-values to determine a pixel (fragment ) colour
 * and pass it on to the fragment shader, setting the z-coordinate to 0.
 * The result is a linearly interpolated color chart of the measurement values in a plane.
 *
 * <p>Usage example:</p>
 *
 * <pre>
 * someNode.addNode({
 *      type: "geometry/kbb_measurementGrid",
 *      width: 2,
 *      height: 2,
 *		zValues: [1.0, 5.5, 1.2, ...],
 *      wire: false // Default
 *  });
 *  </pre>
 */
(function () {

    SceneJS.Types.addType("geometry/kbb_measurementGrid", {

        construct:function (params) {
            this.addNode(build.call(this, params));
        }
		
    });

    function build(params) {

        var width = params.width || 1.0;
        var height = params.height || 1.0;

        var widthSegments = params.widthSegments || 1;
        var heightSegments = params.heightSegments || 1;
		// if not exists, create array of 0's [http://stackoverflow.com/questions/1295584/most-efficient-way-to-create-a-zero-filled-javascript-array] :
		var zValues = params.zValues || Array.apply(null, Array((widthSegments+1)*(heightSegments+1))).map(Number.prototype.valueOf,0);

        var coreId = "geometry/kbb_measurementGrid_" + (params.wire == true ? "wire_" : "") + height + "_" + widthSegments + "_" + heightSegments;

        // If a node core already exists for a prim with the given properties,
        // then for efficiency we'll share that core rather than create another geometry
        if (this.getScene().hasCore("geometry", coreId)) {
            return {
                type: "geometry",
                coreId:coreId
            };
        }

        // Otherwise, create a new geometry

        var positions = [];
        var normals = [];
        var uvs = [];
        var indices = [];

        var ix, iz;
        var halfWidth = width / 2;
        var halfHeight = height / 2;

        var gridX = widthSegments;
        var gridZ = heightSegments;

        var gridX1 = gridX + 1;
        var gridZ1 = gridZ + 1;

        var segWidth = width / gridX;
        var segHeight = height / gridZ;

        var x;
        var y;

		var count = 0;
        for (iz = 0; iz < gridZ1; iz++) {
            for (ix = 0; ix < gridX1; ix++) {

                x = ix * segWidth - halfWidth;
                y = iz * segHeight - halfHeight;

                positions.push(x);
                positions.push(y);
				positions.push(zValues[count++]);

                normals.push(0);
                normals.push(0);
                normals.push(1);

                uvs.push(ix / gridX);
                uvs.push(1 - iz / gridZ);
            }
        }

        var a;
        var b;
        var c;
        var d;

        for (iz = 0; iz < gridZ; iz++) {
            for (ix = 0; ix < gridX; ix++) {

                a = ix + gridX1 * iz;
                b = ix + gridX1 * ( iz + 1 );
                c = ( ix + 1 ) + gridX1 * ( iz + 1 );
                d = ( ix + 1 ) + gridX1 * iz;

                indices.push(a);
                indices.push(b);
                indices.push(c);

                indices.push(c);
                indices.push(d);
                indices.push(a);
            }
        }

        return {
            type: "geometry",
            primitive:params.wire ? "lines" : "triangles",
            coreId:coreId,
            positions:new Float32Array(positions),
            normals:new Float32Array(normals),
            uv:new Float32Array(uvs),
            indices:new Uint16Array(indices)
        };
    }

})();
