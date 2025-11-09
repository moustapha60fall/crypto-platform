// src/components/CardSystem.tsx
import '../assets/CarsSystem.css'

export function CardSystem() {
    return (
        <div className="card">
            <div className="px-2 py-2 md:px-2 lg:px-2">
                <div className="grid">
                    <div className="col-12 md:col-6 lg:col-3">
                        <div className="surface-card shadow-2 p-3 border-round gren">
                            <div className="flex justify-content-between mb-3">
                                <div>
                                    <span className="block text-500 font-medium mb-3">Utilisateurs</span>
                                    <div className="text-900 font-medium text-xl">152</div>
                                </div>
                                <div className="flex align-items-center justify-content-center bg-blue-100 border-round">
                                    <i className="pi pi-shopping-cart text-blue-500 text-xl"></i>
                                </div>
                            </div>
                            <span className="text-green-500 font-medium">24 new </span>
                            <span className="text-500">since last visit</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <div className="surface-card shadow-2 p-3 border-round grey">
                            <div className="flex justify-content-between mb-3">
                                <div>
                                    <span className="block text-500 font-medium mb-3">Assigner</span>
                                    <div className="text-900 font-medium text-xl">$2.100</div>
                                </div>
                                <div className="flex align-items-center justify-content-center bg-orange-100 border-round">
                                    <i className="pi pi-map-marker text-orange-500 text-xl"></i>
                                </div>
                            </div>
                            <span className="text-green-500 font-medium">%52+</span>
                            <span className="text-500">since last week</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <div className="surface-card shadow-2 p-3 border-round gray">
                            <div className="flex justify-content-between mb-3">
                                <div>
                                    <span className="block text-500 font-medium mb-3">Etudiants</span>
                                    <div className="text-900 font-medium text-xl">28441</div>
                                </div>
                                <div className="flex align-items-center justify-content-center bg-cyan-100 border-round">
                                    <i className="pi pi-inbox text-cyan-500 text-xl"></i>
                                </div>
                            </div>
                            <span className="text-green-500 font-medium">520 </span>
                            <span className="text-500">newly registered</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <div className="surface-card shadow-2 p-3 border-round orange">
                            <div className="flex justify-content-between mb-3">
                                <div>
                                    <span className="block text-500 font-medium mb-3">Professeurs</span>
                                    <div className="text-900 font-medium text-xl">152 Unread</div>
                                </div>
                                <div className="flex align-items-center justify-content-center bg-purple-100 border-round">
                                    <i className="pi pi-comment text-purple-500 text-xl"></i>
                                </div>
                            </div>
                            <span className="text-green-500 font-medium">85 </span>
                            <span className="text-500">responded</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <div className="surface-card shadow-2 p-3 border-round orange">
                            <div className="flex justify-content-between mb-3">
                                <div>
                                    <span className="block text-500 font-medium mb-3">Classes</span>
                                    <div className="text-900 font-medium text-xl">$2.100</div>
                                </div>
                                <div className="flex align-items-center justify-content-center bg-orange-100 border-round">
                                    <i className="pi pi-map-marker text-orange-500 text-xl"></i>
                                </div>
                            </div>
                            <span className="text-green-500 font-medium">%52+ </span>
                            <span className="text-500">since last week</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <div className="surface-card shadow-2 p-3 border-round gren">
                            <div className="flex justify-content-between mb-3">
                                <div>
                                    <span className="block text-500 font-medium mb-3">Salles</span>
                                    <div className="text-900 font-medium text-xl">28441</div>
                                </div>
                                <div className="flex align-items-center justify-content-center bg-cyan-100 border-round">
                                    <i className="pi pi-inbox text-cyan-500 text-xl"></i>
                                </div>
                            </div>
                            <span className="text-green-500 font-medium">520 </span>
                            <span className="text-500">newly registered</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
