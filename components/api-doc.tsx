'use client';
import SwaggerUI from "swagger-ui-react"
import 'swagger-ui-react/swagger-ui.css';


const DisableAuthorizePlugin = function () {
    return {
        wrapComponents: {
            authorizeBtn: () => () => null,
            TryItOutButton: () => () => null
        }
    };
};

const ApiDoc = ({ specUrl }: { specUrl: string }) => {
    return (
        <SwaggerUI
            url={specUrl}
            docExpansion="list"
            defaultModelsExpandDepth={1}
            tryItOutEnabled={false}
            plugins={[DisableAuthorizePlugin()]}
            deepLinking={true}

        />
    )
}

export default ApiDoc;